import React from "react";

const ChatProperties = ({ properties, selectedProperty, onSelect }) => {
  return (
    <div className="w-1/5 bg-gray-100 p-4 border-r">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <ul>
        {properties.map((property) => (
          <li
            key={property.id}
            className={`p-2 cursor-pointer rounded-lg ${
              selectedProperty?.id === property.id ? "bg-blue-300" : "hover:bg-gray-200"
            }`}
            onClick={() => onSelect(property)}
          >
            {property.propertyName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatProperties;
