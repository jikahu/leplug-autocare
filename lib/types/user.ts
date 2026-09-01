export type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  zone: "nairobi_metro" | "outside_nairobi";
};

export type User = {
  id: string;
  name: string;
  email: string;
  addresses: Address[];
};
