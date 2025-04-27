declare module 'msgpack-lite' {
    // ExtBuffer
    export class ExtBuffer {
      constructor(buffer: Buffer, type: number);
      buffer: Buffer;
      type: number;
    }
  
    // DecodeBuffer
    export class DecodeBuffer {
      constructor(options?: any);
      offset: number;
      write(input: Buffer | Uint8Array): void;
      read(): any;
    }
  
    // Encoder/Decoder
    export class Encoder {
      constructor(options?: any);
      encode(chunk: any): void;
      end(chunk?: any): void;
    }
    export class Decoder {
      constructor(options?: any);
      decode(chunk: any): void;
      end(chunk?: any): void;
    }
  
    // Codec
    export function createCodec(options?: any): any;
    export const codec: any;
  
    // Streams
    export function createEncodeStream(options?: any): any;
    export function createDecodeStream(options?: any): any;
  
    // Core encode/decode
    export function encode(input: any, options?: any): Buffer;
    export function decode(input: Buffer | Uint8Array | DecodeBuffer, options?: any): any;
  }