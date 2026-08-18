import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Shell } from "../app/shell.js";
import { HomePage } from "../app/home-page.js";

describe("web shell", () => {
  it("renders the skip link and empty-desk copy", () => {
    render(
      <Shell>
        <HomePage />
      </Shell>,
    );
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("heading", { name: /desk is empty/i })).toBeInTheDocument();
    expect(screen.getByText(/no product features yet/i)).toBeInTheDocument();
  });
});
