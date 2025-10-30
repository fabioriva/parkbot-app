export type Bit = {
  addr: string;
  label: string;
  status: number;
};

export type Encoder = {
  destination: number;
  id: number;
  name: string;
  position: number;
};

export type Log = {
  card: number;
  date: string;
  device: { id: number; key: string };
  mode: { id: number; key: string };
  operation: { id: number; key: string };
  size: number;
  stall: number;
};

export type Motor = {
  encoders: Encoder[];
  id: number;
  io: Bit[];
  message: string;
  name: { key: string; query: any };
  run: Bit;
};

export type Stall = {
  date: string;
  nr: number;
  size: number;
  status: number;
};
