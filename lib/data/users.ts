import type { User } from "@/lib/types";

export const users: User[] = [
  {
    id: "user-1",
    name: "Jane Wanjiru",
    email: "jane@example.com",
    addresses: [
      {
        id: "address-1",
        label: "Home",
        line1: "123 Ngong Road",
        city: "Nairobi",
        zone: "nairobi_metro",
      },
    ],
  },
];
