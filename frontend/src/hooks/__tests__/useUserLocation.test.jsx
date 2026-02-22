import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useUserLocation from "../useUserLocation";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from "axios";

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockClear();

  vi.stubGlobal("navigator", {
    geolocation: {
      getCurrentPosition: vi.fn(),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useUserLocation", () => {
  it("returns initial state with position null and search disabled", () => {
    const { result } = renderHook(() => useUserLocation());
    expect(result.current.position).toBe(null);
    expect(result.current.positionSource).toBe("unknown");
    expect(result.current.locationStatus).toBe("pending");
    expect(result.current.locationMessage).toBe("Determining your location...");
    expect(result.current.isSearchEnabled).toBe(false);
  });

  it("updates position and set positionSource to 'precise' on successful browser geolocation", async () => {
    const mockGetPosition = vi.fn((successCallback) => {
      successCallback({
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });
    });

    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: mockGetPosition,
      },
    });

    const { result } = renderHook(() => useUserLocation());

    await waitFor(() => {
      expect(result.current.position).toEqual([40.7128, -74.006]);
    });

    expect(result.current.positionSource).toBe("precise");
    expect(result.current.locationStatus).toBe("success");
    expect(result.current.locationMessage).toBe("Location determined");
    expect(result.current.isSearchEnabled).toBe(true);
    expect(mockGetPosition).toHaveBeenCalledTimes(1);
  });

  it("falls back to IP geolocation when browser geolocation fails", async () => {
    const mockGetPosition = vi.fn((successCallback, errorCallback) => {
      errorCallback({
        code: 1,
        message: "User denied Geolocation",
      });
    });

    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: mockGetPosition,
      },
    });

    axios.get.mockResolvedValueOnce({
      data: {
        coords: [37.7749, -122.4194],
      },
    });

    const { result } = renderHook(() => useUserLocation());

    await waitFor(() => {
      expect(result.current.position).toEqual([37.7749, -122.4194]);
    });

    expect(result.current.positionSource).toBe("coarse");
    expect(result.current.locationStatus).toBe("success");
    expect(result.current.isSearchEnabled).toBe(true);
    expect(mockGetPosition).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith("/geolocate/");
  });

  it("sets error state when both browser and IP geolocation fail", async () => {
    const mockGetPosition = vi.fn((successCallback, errorCallback) => {
      errorCallback({
        code: 1,
        message: "User denied Geolocation",
      });
    });

    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: mockGetPosition,
      },
    });

    axios.get.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useUserLocation());

    await waitFor(() => {
      expect(result.current.locationStatus).toBe("error");
    });

    expect(result.current.position).toBe(null);
    expect(result.current.positionSource).toBe("unknown");
    expect(result.current.locationMessage).toBe("Unable to determine location");
    expect(result.current.isSearchEnabled).toBe(false);
  });
});
