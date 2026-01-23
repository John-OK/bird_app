import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("RTL", () => {
  it("renders React into jsdom", () => {
    render(<div>hello!</div>);
    const element = screen.getByText("hello!");
    expect(element).toBeInTheDocument();
  });
});
