import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import GenericForm from "../components/GenericForm";
import * as GenericList from "../components/GenericList";

jest.mock("axios");
jest.mock("../components/GenericList", () => ({
  useBaseUrl: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
  GenericList.useBaseUrl.mockReturnValue("http://localhost/racing/api/");

  axios.get.mockImplementation((url, config) => {
  if (url.includes("drivers") && config?.params?.unassigned === true) {
    return Promise.resolve({
      data: [
        { id: 1, first_name: "Raju", last_name: "K" },
        { id: 2, first_name: "Sunil", last_name: "C" },
      ],
    });
  }

  return Promise.resolve({ data: [] });
});

});


const models = [
  {
    name: "teams",
    fields: ["team_name:", "city:", "country:", "description:", "drivers:"],
    formData: {
      "team_name:": "Team A",
      "city:": "Hyderabad",
      "country:": "India",
      "description:": "F1 team",
      "drivers:": ["Raju K"]
    },
  },
  {
    name: "drivers",
    fields: ["first_name:", "last_name:", "date_of_birth:"],
    formData: {
      "first_name:": "Raju",
      "last_name:": "K",
      "date_of_birth:": "1997-09-30",
    },
  },
  {
    name: "races",
    fields: ["track_name:", "city:", "country:", "race_date:", "registration_closure_date:"],
    formData: {
      "track_name:": "Track A",
      "city:": "Hyderabad",
      "country:": "India",
      "race_date:": "2025-07-15",
      "registration_closure_date:": "2025-07-01",
    },
  },
];

test.each(models)("renders form fields for %s model", async ({ name, fields, formData }) => {
  render(
    <MemoryRouter initialEntries={[`/${name}/create`]}>
      <Routes>
        <Route path="/:model/create" element={<GenericForm model={name} />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  });

  for (const label of fields) {
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  }
  
  for (const [label, value] of Object.entries(formData)) {
  const input = screen.getByLabelText(label);
  if (Array.isArray(value)) {
    for (const name of value) {
      const option = Array.from(input.options).find(
        (opt) => opt.textContent === name
      );
      if (option) option.selected = true;
    }
    fireEvent.change(input);
  } else {
    fireEvent.change(input, { target: { value } });
  }
}

});

test.each(models)("submits form data correctly for %s model", async ({ name, formData }) => {
    jest.useFakeTimers();
  axios.post.mockResolvedValueOnce({ data: { message: "Saved successfully." } });

  render(
    <MemoryRouter initialEntries={[`/${name}/create`]}>
      <Routes>
        <Route path="/:model/create" element={<GenericForm model={name} />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  });

  for (const [label, value] of Object.entries(formData)) {
    fireEvent.change(screen.getByLabelText(label), {
      target: { value },
    });
  }

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Create/i }));
  });
  act(() => {
        jest.runAllTimers();
    });
    await act(() => Promise.resolve());

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(`/${name}`);
  });
});

