import React from "react";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useBaseUrl } from "./GenericList";

const fieldConfig = {
  teams: [
    { name: "team_name" },
    { name: "city" },
    { name: "country" },
    { name: "logo_image", type: "file" },
    { name: "description" },
    { name: "drivers", type: "multiselect", optionsKey: "drivers", optionLabel: (d) => `${d.first_name} ${d.last_name}`,},
  ],
  drivers: [
    { name: "first_name" },
    { name: "last_name" },
    { name: "date_of_birth", type: "date" },
  ],
  races: [
    { name: "track_name" },
    { name: "city" },
    { name: "country" },
    { name: "race_date", type: "date" },
    { name: "registration_closure_date", type: "date" },
    {
      name: "drivers",
      type: "multiselect",
      optionsKey: "drivers",
      optionLabel: (d) => `${d.first_name} ${d.last_name}`,
    },
  ],
};

function GenericForm({ model }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseUrl = useBaseUrl();

  const API = {
    create: `${baseUrl}${model}/create/`,
    edit: (id) => `${baseUrl}${model}/edit/${id}/`,
  };

  // eslint-disable-next-line
  useEffect(() => {
    if (!baseUrl) return;
    fetchData();
  }, [baseUrl, id]);

  const getSelectedDriverIds = (driverList, nameList) => {
    return driverList
      .filter((d) => nameList.includes(`${d.first_name} ${d.last_name}`))
      .map((d) => d.id);
  };

  const fetchData = async () => {
    try {
      if (id) {
        const response = await axios.get(API.edit(id));
        const data = response.data;
        if (model === "races") {
          const res = await axios.get(`${baseUrl}drivers/`);
          setDrivers(res.data);
          if (Array.isArray(data.driver_names)) {
            data.drivers = getSelectedDriverIds(res.data, data.driver_names);
          }
        }
        if (model === "teams") {
          const res = await axios.get(`${baseUrl}drivers/`, {
            params: { unassigned: true, team_id: id },
          });
          setDrivers(res.data);
          if (Array.isArray(data.driver_names)) {
            data.drivers = getSelectedDriverIds(res.data, data.driver_name);
          }
        }
        setForm(data);
      }
      if (model === "teams" && !id) {
        const res = await axios.get(`${baseUrl}drivers/`, {
          params: { unassigned: true },
        });
        setDrivers(res.data);
      }
      if (model === "drivers") {
        const res = await axios.get(`${baseUrl}teams/`);
        setTeams(res.data);
      }
      if (model === "races" && !id) {
        const res = await axios.get(`${baseUrl}drivers/`);
        setDrivers(res.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files, multiple, options } = e.target;
    if (files) {
      setFile(files[0]);
    } else if (multiple) {
      setForm({ ...form, [name]: Array.from(options).filter((o) => o.selected).map((o) => o.value),});
    } else {
      setForm({ ...form, [name]: value === "" ? null : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "logo_image") return;
      const isDateField = fieldConfig[model].some(
        (f) => f.name === k && f.type === "date",
      );
      if (isDateField) {
        if (v === null || v === undefined || v === "") return;
      }
      if (Array.isArray(v)) {
        v.forEach((val) => formData.append(k, val));
      } else {
        formData.append(k, v ?? "");
      }
    });
    if (file) formData.append("logo_image", file);
    try {
      const method = model === "teams" ? "patch" : "put";
      const response = id
        ? await axios[method](API.edit(id), formData)
        : await axios.post(API.create, formData);
      setMessage({
        type: "success",
        text: response.data.message || "Saved successfully.",
      });
      setTimeout(() => { navigate(`/${model}`); }, 1000);
    } catch (err) {
      const errorData = err.response?.data || { error: ["An unexpected error occurred."],};
      alert( Object.entries(errorData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n"),);
    }
  };

  const renderField = ({ name, type, optionsKey, optionLabel }) => {
    const value = form[name] || "";
    const options = optionsKey === "teams" ? teams : drivers;
    switch (type) {
      case "file":
        return (
          <div key={name} className="logo">
            <label htmlFor={name}>{name}:</label>
            {form[name] && (
              <div>
                <p> Currently:{" "} <a href={form[name]} target="_blank" rel="noopener noreferrer"> {form[name]} </a> </p>
                <p>Change: <input type="file" id={name} name={name} onChange={handleChange} /></p>
              </div>
            )}
            {!form[name] && (
            <input type="file" id={name} name={name} onChange={handleChange} />)}
          </div>
        );
      case "multiselect":
        return (
          <div key={name} className="multiselect">
            <label htmlFor={name}>{name}:</label>
            <select
              multiple
              id={name}
              name={name}
              value={form[name] || []}
              onChange={handleChange}
            >
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {typeof optionLabel === "function"
                    ? optionLabel(opt)
                    : opt[optionLabel]}
                </option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <div key={name}>
            <label htmlFor={name}>{name}:</label>
            <input
              type="text"
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
            />
          </div>
        );
    }
  };
  if (loading) return <p>Loading...</p>;
  return (
    <>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>
          {id ? `Edit ${model.slice(0, -1)}` : `Create ${model.slice(0, -1)}`}
        </h2>
        <ul className="message-container">
          {message && (
              <li className={ message.type }>{message.text}</li>
          )}
        </ul>
        <div className="form">{fieldConfig[model].map(renderField)}</div>
        <Link to={`/${model}`}>
          <button type="button">Close</button>
        </Link>
        <button type="submit">{id ? "Update" : "Create"}</button>
      </form>
    </>
  );
}

export default GenericForm;
