import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import axios from "axios";
import '@testing-library/jest-dom';
import { BrowserRouter } from "react-router-dom";
import { GenericList } from "../components/GenericList"; 
jest.mock("axios");

const mockItems = [
  { id: 1, last_name: "C", first_name: "Sunthu", team_name: "Team A" },
  { id: 2, last_name: "C", first_name: "Sunil", team_name: "Team B" },
];

const renderWithRouter = (ui) =>
  act(() => {
    render(<BrowserRouter>{ui}</BrowserRouter>);
  });

describe("GenericList", () => {
  beforeEach(() => {
    axios.get.mockClear();
    axios.delete.mockClear();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve("localhost"),
      })
    );
  });

  test("renders loading state", async () => {
  let resolvePromise;
  const mockPromise = new Promise((resolve) => {
    resolvePromise = resolve;
  });

  axios.get.mockReturnValueOnce(mockPromise);

  renderWithRouter(<GenericList model="drivers" />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await act(async () => {
    resolvePromise({ data: mockItems });
  });
});


  test("renders no data message", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    await act(async () => {
      renderWithRouter(<GenericList model="drivers" />);
    });
    await waitFor(() =>
      expect(screen.getByText(/No data available/i)).toBeInTheDocument()
    );
  });

  test("renders table with data", async () => {
    axios.get.mockResolvedValueOnce({ data: mockItems });
    await act(async () => {
      renderWithRouter(<GenericList model="drivers" />);
    });
    await waitFor(() => expect(screen.getByText(/Team A/i)).toBeInTheDocument());
    expect(screen.getByText(/Team B/i)).toBeInTheDocument();
  });

  test("selects and deselects all checkboxes", async () => {
    axios.get.mockResolvedValueOnce({ data: mockItems });
    await act(async () => {
      renderWithRouter(<GenericList model="drivers" />);
    });
    await waitFor(() => screen.getByText(/Team A/i));
    const checkboxes = screen.getAllByRole("checkbox");
    const selectAll = checkboxes[0];
    fireEvent.click(selectAll);
    expect(checkboxes[1].checked).toBe(true);
    fireEvent.click(selectAll);
    expect(checkboxes[1].checked).toBe(false);
  });

  test("handles delete confirmation and API call", async () => {
    axios.get.mockResolvedValueOnce({ data: mockItems });
    axios.delete.mockResolvedValueOnce({ data: { message: "Deleted" } });
    window.confirm = jest.fn(() => true);

    await act(async () => {
      renderWithRouter(<GenericList model="drivers" />);
    });

    await waitFor(() => screen.getByText(/Team A/i));
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    fireEvent.click(screen.getByText(/Delete/i));

    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
  });
});
