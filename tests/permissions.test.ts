import { describe, expect, it, vi } from "vitest";
import {
  CONTENT_SCRIPT_ID,
  CONTENT_SCRIPT_REGISTRATION,
  syncContentScriptRegistration,
  type RegistrationApi
} from "../src/lib/permissions/contentScriptRegistration";

function api(allowed: boolean, registered: boolean): RegistrationApi & {
  register: ReturnType<typeof vi.fn>;
  unregister: ReturnType<typeof vi.fn>;
} {
  return {
    hasPermission: async () => allowed,
    getRegistered: async () => registered ? [{ ...CONTENT_SCRIPT_REGISTRATION }] : [],
    register: vi.fn(async () => undefined),
    unregister: vi.fn(async () => undefined)
  };
}

describe("runtime content script registration", () => {
  it("does not register before website access is granted", async () => {
    const mock = api(false, false);
    expect(await syncContentScriptRegistration(mock)).toBe("unchanged");
    expect(mock.register).not.toHaveBeenCalled();
  });

  it("registers HTTP and HTTPS pages in every frame after authorization", async () => {
    const mock = api(true, false);
    expect(await syncContentScriptRegistration(mock)).toBe("registered");
    expect(mock.register).toHaveBeenCalledWith(expect.objectContaining({
      id: CONTENT_SCRIPT_ID,
      matches: ["http://*/*", "https://*/*"],
      allFrames: true,
      matchOriginAsFallback: true
    }));
  });

  it("does not duplicate registration on repeated startup", async () => {
    const mock = api(true, true);
    expect(await syncContentScriptRegistration(mock)).toBe("unchanged");
    expect(mock.register).not.toHaveBeenCalled();
  });

  it("unregisters when website access is revoked", async () => {
    const mock = api(false, true);
    expect(await syncContentScriptRegistration(mock)).toBe("unregistered");
    expect(mock.unregister).toHaveBeenCalledWith(CONTENT_SCRIPT_ID);
  });
});
