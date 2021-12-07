import { Box, Select } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { ALL_CATEGORIES_QUERY } from "./EditCategories";

function SelectCategory({ onCategoryChange, defaultValue }) {
  const { data } = useQuery(ALL_CATEGORIES_QUERY, {
    pollInterval: 10 * 60 * 1000, // get new data every 10 mins
  });

  return (
    <Box>
      <Select
        placeholder="Select Category"
        defaultValue={defaultValue}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        {data?.categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </Select>
    </Box>
  );
}

export { SelectCategory };
