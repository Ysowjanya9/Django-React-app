import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import GenericView from "../components/GenericView";
import * as GenericList from "../components/GenericList";

jest.mock("axios");

const mockUseBaseUrl = jest.spyOn(GenericList, "useBaseUrl");

const mockItem = {
  id: 1,
  track_name: "Team A",
  driver_names: ["Sunil C"],
  driver_team: ["Team A"]
};

describe("GenericView Component", () => {
  beforeEach(() => {
    mockUseBaseUrl.mockReturnValue("http://localhost/api/");
  });

  it("renders loading state initially", () => {
  axios.get.mockImplementation(() => new Promise(() => {})); // never resolves

  render(
    <MemoryRouter initialEntries={["/races/view/1"]}>
      <Routes>
        <Route path="/:model/view/:id" element={<GenericView model="teams" />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
});

  it("renders item details after successful fetch", async () => {
    axios.get.mockResolvedValueOnce({ data: mockItem });

    render(
      <MemoryRouter initialEntries={["/teams/view/1"]}>
        <Routes>
          <Route path="/:model/view/:id" element={<GenericView model="teams" />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
  expect(screen.getByText(/Details of Team A/i)).toBeInTheDocument();
  expect(
    screen.getByText((content, element) => {
      return (
        element.tagName.toLowerCase() === "span" &&
        content.includes("Sunil C") &&
        content.includes("from") &&
        element.querySelector("strong")?.textContent === "Team A"
      );
    })
  ).toBeInTheDocument();
});

  });

  it("renders 'Item not found' on fetch failure", async () => {
  jest.spyOn(console, "error").mockImplementation(() => {}); // suppress error log

  axios.get.mockRejectedValueOnce(new Error("Not found"));

  render(
    <MemoryRouter initialEntries={["/teams/view/1"]}>
      <Routes>
        <Route path="/:model/view/:id" element={<GenericView model="teams" />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Item not found/i)).toBeInTheDocument();
  });

  console.error.mockRestore(); // restore after test
});
});
