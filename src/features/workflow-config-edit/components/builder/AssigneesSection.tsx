import React, { useState, useRef, useEffect } from "react";
import { Users, UserPlus, X, Search } from "lucide-react";
import type { Person } from "@features/workflow-config-edit/types/builder.types";
import "./AssigneesSection.css";

interface AssigneesSectionProps {
  assignees: Person[];
  availablePeople: Person[];
  onAdd: (person: Person) => void;
  onRemove: (personId: string) => void;
}

export const AssigneesSection: React.FC<AssigneesSectionProps> = ({
  assignees,
  availablePeople,
  onAdd,
  onRemove,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
        setSearchQuery("");
      }
    };

    if (isSearching) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSearching]);

  const filtered = availablePeople.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !assignees.some((a) => a.id === p.id)
  );

  return (
    <div className="assignees-section">
      <div className="section-header">
        <h4 className="section-title">
          <Users size={14} />
          <span>Assignees</span>
        </h4>
        <button
          className="add-btn"
          onClick={() => setIsSearching(true)}
          title="Add assignee"
        >
          <UserPlus size={14} />
          <span>Add</span>
        </button>
      </div>

      {isSearching && (
        <div ref={searchRef} className="assignee-search">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="search-results">
            {filtered.length > 0 ? (
              filtered.map((person) => (
                <button
                  key={person.id}
                  className="person-option"
                  onClick={() => {
                    onAdd(person);
                    setIsSearching(false);
                    setSearchQuery("");
                  }}
                >
                  <div className="person-info">
                    <span className="person-name">{person.name}</span>
                    <span className="person-type">{person.type}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="no-results">No people found</div>
            )}
          </div>
        </div>
      )}

      <div className="assignees-list">
        {assignees.length > 0 ? (
          assignees.map((person) => (
            <div key={person.id} className="assignee-chip">
              <div className="chip-avatar">
                {person.name.charAt(0).toUpperCase()}
              </div>
              <span className="chip-name">{person.name}</span>
              <span className="chip-type">{person.type}</span>
              <button
                className="chip-remove"
                onClick={() => onRemove(person.id)}
                title="Remove assignee"
              >
                <X size={12} />
              </button>
            </div>
          ))
        ) : (
          <div className="empty-assignees">
            <Users size={20} />
            <span>No assignees yet</span>
          </div>
        )}
      </div>
    </div>
  );
};
