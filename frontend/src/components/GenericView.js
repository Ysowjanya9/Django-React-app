import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useBaseUrl } from "./GenericList";

function GenericView({ model }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseUrl = useBaseUrl();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!baseUrl) return;
    axios
      .get(`${baseUrl}${model}/edit/${id}/`)
      .then((res) => setItem(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [baseUrl, id, model]);

  if (loading) return <p>Loading...</p>;
  if (!item) return <p>Item not found.</p>;

  return (
    <div>
      <h2>{" "}
        Details of{" "}
        {item.team_name ||
          item.track_name ||
          `${item.first_name || ""} ${item.last_name || ""}`}{" "}
      </h2>
      {Object.entries(item).map(([key, value]) =>
        key === "id" || key === "driver_team" ? null : (
          <div key={key} className="generic-view-field">
            <strong>{key.replace(/_/g, " ")}:</strong>
            {"  "}
            {key === "logo_image" && value ? (
              <img src={value} alt="Logo" />
            ) : Array.isArray(value) ? (
              value.length === 0 ? (
                key === "completed_races" ? (
                  "No completed races available."
                ) : key === "upcoming_races" ? (
                  "No upcoming races available."
                ) : (
                  "None"
                )
              ) : key === "completed_races" || key === "upcoming_races" || key === "driver_names" ? (
                <ol>
                  {value.map((race, index) => (
                    <li key={index}>
                      {" "}
                      {key === "completed_races"
                        ? (`${race.track_name} - held on ${race.race_date}`)
                        : key === "upcoming_races" ? `${race.track_name} - scheduled for ${race.race_date}, registration closes on ${race.registration_closure_date === null ? "(no data available)" : race.registration_closure_date}` : <span>{race} from <strong>{item.driver_team[index] || "Unknown Team"}</strong></span> }
                    </li>
                  ))}
                </ol>
              ) : (
                value.join(", ")
              )
            ) : (
              value?.toString() || "None"
            )}
          </div>
        ),
      )}
      <div className="generic-view-close-button">
        <button onClick={() => navigate(-1)}>Close</button>
        <Link to={`/${model}/edit/${item.id}`}>
          <button>Edit</button>
        </Link>
      </div>
    </div>
  );
}

export default GenericView;
