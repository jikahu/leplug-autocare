// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth";
import { users as seedUsers } from "@/lib/data/users";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null, users: seedUsers });
    localStorage.clear();
  });

  it("starts logged out with the seeded users available", () => {
    expect(useAuthStore.getState().currentUser).toBeNull();
    expect(useAuthStore.getState().users).toEqual(seedUsers);
  });

  it("logs in an existing user by email, case-insensitively", () => {
    const success = useAuthStore.getState().login("JANE@example.com");
    expect(success).toBe(true);
    expect(useAuthStore.getState().currentUser?.email).toBe("jane@example.com");
  });

  it("fails to log in an unknown email", () => {
    const success = useAuthStore.getState().login("nobody@example.com");
    expect(success).toBe(false);
    expect(useAuthStore.getState().currentUser).toBeNull();
  });

  it("registers a new user and logs them in", () => {
    const success = useAuthStore.getState().register("New Person", "new@example.com");
    expect(success).toBe(true);
    expect(useAuthStore.getState().currentUser?.email).toBe("new@example.com");
    expect(useAuthStore.getState().users).toHaveLength(seedUsers.length + 1);
  });

  it("fails to register an email that's already taken", () => {
    const success = useAuthStore.getState().register("Someone Else", "jane@example.com");
    expect(success).toBe(false);
    expect(useAuthStore.getState().users).toHaveLength(seedUsers.length);
  });

  it("logs out", () => {
    useAuthStore.getState().login("jane@example.com");
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().currentUser).toBeNull();
  });

  it("updates the current user's profile and keeps the users list in sync", () => {
    useAuthStore.getState().login("jane@example.com");
    useAuthStore.getState().updateProfile({ name: "Jane Updated", email: "jane@example.com" });
    expect(useAuthStore.getState().currentUser?.name).toBe("Jane Updated");
    const stored = useAuthStore.getState().users.find((u) => u.id === "user-1");
    expect(stored?.name).toBe("Jane Updated");
  });

  it("adds an address to the current user", () => {
    useAuthStore.getState().login("jane@example.com");
    useAuthStore.getState().addAddress({
      id: "address-2",
      label: "Work",
      line1: "456 Kenyatta Ave",
      city: "Nairobi",
      zone: "nairobi_metro",
    });
    expect(useAuthStore.getState().currentUser?.addresses).toHaveLength(2);
  });

  it("updates an address on the current user", () => {
    useAuthStore.getState().login("jane@example.com");
    useAuthStore.getState().updateAddress("address-1", { city: "Kiambu" });
    expect(useAuthStore.getState().currentUser?.addresses[0].city).toBe("Kiambu");
  });

  it("removes an address from the current user", () => {
    useAuthStore.getState().login("jane@example.com");
    useAuthStore.getState().removeAddress("address-1");
    expect(useAuthStore.getState().currentUser?.addresses).toHaveLength(0);
  });

  it("persists auth state to localStorage under the leplug-auth key", () => {
    useAuthStore.getState().login("jane@example.com");
    const raw = localStorage.getItem("leplug-auth");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.currentUser.email).toBe("jane@example.com");
  });
});
