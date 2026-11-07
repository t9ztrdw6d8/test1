// pl2303-webusb.js — Prolific PL2303 (o.a. ACT AC6002) via WebUSB
// Werkt in Chrome/Edge op Android (HTTPS of localhost vereist). Niet in Firefox.
// Gebaseerd op het init-protocol van de Linux pl2303-driver.

const PROLIFIC_VID = 0x067b;
// G-serie ("HXN") heeft een ander register-protocol
const HXN_PIDS = [0x23a3, 0x23b3, 0x23c3, 0x23d3, 0x23e3, 0x23f3];

export class PL2303 {
  constructor(device) {
    this.device = device;
    this.isHXN = HXN_PIDS.includes(device.productId);
    this.onData = null; // callback(Uint8Array)
    this._reading = false;
  }

  static async request() {
    const device = await navigator.usb.requestDevice({
      filters: [{ vendorId: PROLIFIC_VID }],
    });
    return new PL2303(device);
  }

  // Eerder toegestane adapter terugvinden zonder picker
  static async getPaired() {
    const devs = await navigator.usb.getDevices();
    const d = devs.find((x) => x.vendorId === PROLIFIC_VID);
    return d ? new PL2303(d) : null;
  }

  // ---- low-level control transfers ----
  async _vRead(value) {
    const r = await this.device.controlTransferIn(
      { requestType: 'vendor', recipient: 'device',
        request: this.isHXN ? 0x81 : 0x01, value, index: 0 }, 1);
    return r.data ? r.data.getUint8(0) : 0;
  }
  async _vWrite(value, index) {
    // HX: value=register, index=data | HXN: value=register, index=data
    await this.device.controlTransferOut(
      { requestType: 'vendor', recipient: 'device',
        request: this.isHXN ? 0x80 : 0x01, value, index });
  }

  async open({ baudRate = 9600, dataBits = 8, stopBits = 1, parity = 'none' } = {}) {
    const d = this.device;
    await d.open();
    if (d.configuration === null) await d.selectConfiguration(1);
    await d.claimInterface(0);

    // Endpoints zoeken i.p.v. hard te coderen (meestal OUT 0x02, IN 0x83)
    const alt = d.configuration.interfaces[0].alternate;
    this.epOut = alt.endpoints.find((e) => e.type === 'bulk' && e.direction === 'out').endpointNumber;
    this.epIn  = alt.endpoints.find((e) => e.type === 'bulk' && e.direction === 'in').endpointNumber;

    if (!this.isHXN) {
      // "Magische" HX/TA/RA-initsequentie (zoals Linux/usb-serial-for-android)
      await this._vRead(0x8484); await this._vWrite(0x0404, 0);
      await this._vRead(0x8484); await this._vRead(0x8383);
      await this._vRead(0x8484); await this._vWrite(0x0404, 1);
      await this._vRead(0x8484); await this._vRead(0x8383);
      await this._vWrite(0, 1);
      await this._vWrite(1, 0);
      await this._vWrite(2, 0x44);
    } else {
      // HXN: flow control uit (reg 0x0A, bits 0x1C)
      const fc = await this._vRead(0x0a);
      await this._vWrite(0x0a, (fc & ~0x1c) | 0x1c);
    }

    // SET_LINE_CODING (CDC-compatibel class request)
    const lc = new DataView(new ArrayBuffer(7));
    lc.setUint32(0, baudRate, true);
    lc.setUint8(4, stopBits === 2 ? 2 : 0);
    lc.setUint8(5, { none: 0, odd: 1, even: 2 }[parity] ?? 0);
    lc.setUint8(6, dataBits);
    await d.controlTransferOut(
      { requestType: 'class', recipient: 'interface', request: 0x20, value: 0, index: 0 }, lc);

    // SET_CONTROL_LINE_STATE: DTR + RTS aan
    await d.controlTransferOut(
      { requestType: 'class', recipient: 'interface', request: 0x22, value: 0x03, index: 0 });

    this._readLoop();
  }

  async _readLoop() {
    this._reading = true;
    while (this._reading) {
      try {
        const r = await this.device.transferIn(this.epIn, 64);
        if (r.status === 'stall') { await this.device.clearHalt('in', this.epIn); continue; }
        if (r.data && r.data.byteLength && this.onData) {
          this.onData(new Uint8Array(r.data.buffer, r.data.byteOffset, r.data.byteLength));
        }
      } catch (e) {
        if (this._reading) console.error('PL2303 read error', e);
        break;
      }
    }
  }

  async write(data) {
    const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    await this.device.transferOut(this.epOut, buf);
  }

  async close() {
    this._reading = false;
    try {
      await this.device.controlTransferOut(
        { requestType: 'class', recipient: 'interface', request: 0x22, value: 0, index: 0 });
      await this.device.releaseInterface(0);
    } catch (_) {}
    await this.device.close();
  }
}

/* ---- Gebruik ----
import { PL2303 } from './pl2303-webusb.js';

btn.onclick = async () => {            // moet vanuit een klik (user gesture)
  const port = (await PL2303.getPaired()) ?? (await PL2303.request());
  const dec = new TextDecoder();
  port.onData = (bytes) => handleIncoming(dec.decode(bytes, { stream: true }));
  await port.open({ baudRate: 9600 });  // zet hier de BK5030-baudrate
  await port.write('\r');               // bv. prompt AF:> uitlokken
};
*/
