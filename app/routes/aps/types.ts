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

type Motor = {
  encoders: Encoder[];
  id: number;
  io: Bit[];
  message: string;
  name: { key: string; query: any };
  run: Bit;
};
