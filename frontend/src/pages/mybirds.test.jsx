import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

vi.mock("axios", () => {
  return {
    default: {
      get: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import axios from "axios";
import MyBirdsPage from "./mybirds.jsx";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe("MyBirdsPage", () => {
  it("shows empty state when API returns no birds", async () => {
    axios.get.mockResolvedValueOnce({ data: { birds: [] } });
    render(<MyBirdsPage />);
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/get_users_birds/"),
    );
    expect(screen.getByText("No saved birds yet.")).toBeInTheDocument();
    expect(screen.getByText("Confirm a bird to save it!")).toBeInTheDocument();

    expect(
      screen.getByText(
        '(Click on a bird icon on the map. Then click "Confirm that bird!")',
      ),
    ).toBeInTheDocument();
  });

  it("when the API returns birds, the page renders the ‘table state’ (not empty state).", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        birds: [
          {
            id: 1,
            name: "Cooper's Hawk",
            coords: ["38.57", "-121.7617"],
            date: "Thursday, March 11, 2021 08:00AM",
          },
        ],
      },
    });
    render(<MyBirdsPage />);
    await screen.findByText("Cooper's Hawk");
    await screen.findByText("38.57, -121.7617");
    await screen.findByText("Thursday, March 11, 2021 08:00AM");
    expect(screen.queryByText("No saved birds yet.")).not.toBeInTheDocument();
  });
});
