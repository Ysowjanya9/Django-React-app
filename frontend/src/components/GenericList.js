import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const useBaseUrl = () => {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    fetchBaseUrl();
  }, []);

  const fetchBaseUrl = async () => {
    try {
      const ip = await fetch("/backendhost.txt");
      let host = (await ip.text()).trim() || window.location.hostname;
      const url = `${window.location.protocol}//${host}:8000/racing/api/`;
      setBaseUrl(url);
    } catch {
      const fallback = `${window.location.protocol}//${window.location.hostname}:8000/racing/api/`;
      setBaseUrl(fallback);
    }
  };
  return baseUrl;
};

function GenericList({ model }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const baseUrl = useBaseUrl();

  // eslint-disable-next-line
  useEffect(() => {
    if (!baseUrl) return;
    fetchItems();
  }, [baseUrl]);

  const API = {
    list: `${baseUrl}${model}/`,
    delete: `${baseUrl}${model}/delete/`,
  };

  const fetchItems = () => {
    setLoading(true);
    axios
      .get(API.list)
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Fetch error:", err.message))
      .finally(() => setLoading(false));
  };

  const handleCreateClick = async () => {
  if (model === "teams") {
    try {
      await axios.get(`${baseUrl}teams/create/`);
      window.location.href = `/${model}/create`;
    } catch (err) {
      const msg = err.response?.data?.message || "Creation not allowed.";
      setMessage({ type: "error", text: msg });
    }
    setTimeout(() => { setMessage(null); }, 1000);
  } else {
    window.location.href = `/${model}/create`;
  }
};


  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const key = model === "teams" ? "team_ids" : model === "drivers" ? "driver_ids" : "race_ids";
      const response = await axios.delete(API.delete, { data: { [key]: selected }, });
      setMessage({ type: "success", text: response.data.message });
      fetchItems();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Unexpected error or The page may not be updated.", });
    }
    setTimeout(() => { setMessage(null); }, 1000);
  };
  return (
    <div>
      <h2 className="table-heading">
        {model.charAt(0).toUpperCase() + model.slice(1)}
      </h2>
      <ul className="message-container">{message && (
            <li className={ message.type }>{message.text}</li>
        )}
      </ul>
      {loading ? ( <p>Loading...</p> ) : items.length === 0 ? ( <p>No data available</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              {Object.keys(items[0]).map((k) => k === "id" || k === "first_name" || k === "driver_team" ? null : (
                  <th key={k}>{k === "last_name" ? "Driver Name" : k.replace(/_/g, " ")}</th>),
              )}
              <th>
                Checkbox{" "}
                <input type="checkbox" checked={selectAll} onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectAll(checked);
                    setSelected(checked ? items.map((i) => i.id) : []);
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {Object.keys(item).map((key) => key === "id" || key === "first_name" || key === "driver_team" ? null : (
                    <td key={key}>
                      {key === "logo_image" && item[key] ? (
                        <a href={item[key]} target="_blank" rel="noreferrer">Logo</a>
                      ) : key === "last_name" ? ( <Link className="view-link" to={`/${model}/view/${item.id}`}> {item.first_name} {item.last_name} </Link>
                      ) : key === "team_name" || key === "track_name" ? ( <Link className="view-link" to={`/${model}/view/${item.id}`}>{item[key]}</Link>
                      ) : Array.isArray(item[key]) ? (
                        item[key].length === 0 ? ( key === "completed_races" ? "No completed races" : key === "upcoming_races" ? "No upcoming races" :
                          "None"
                        ) : (
                          item[key]
                            .map((obj) =>
                              typeof obj === "string"
                                ? obj
                                : obj.track_name,
                            )
                            .join(", ")
                        )
                      ) : item[key] === "" || item[key] === null ? (
                        "None"
                      ) : (
                        item[key]
                      )}
                    </td>
                  ),
                )}
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((i) => i !== item.id)
                          : [...prev, item.id],
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="create-buttons">
        <button onClick={() => handleDelete()} disabled={selected.length === 0}>
          {" "}
          Delete{" "}
        </button>
        <br></br>
        <br></br>
        <Link to={"/"}>
          <button>Home</button>
        </Link>
        <button onClick={handleCreateClick}>Create</button>
      </div>
    </div>
  );
}

export { useBaseUrl, GenericList };
