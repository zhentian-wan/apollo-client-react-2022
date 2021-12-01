import { UiAppLayout } from "./shared-ui/UiAppLayout";
import { Box, Button, Stack } from "@chakra-ui/react";
import { NoteList } from "./NoteList";
import { useState } from "react";
import { SlimNoteList } from "./SlimNotesList";
import { SelectCategory } from "./SelectCategory";

function App() {
  const [slimListOpen, setSlimListOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("1");
  return (
    <UiAppLayout>
      <Stack width={400}>
        <SelectCategory
          defaultValue={selectedCategory}
          onCategoryChange={(category) => setSelectedCategory(category)}
        ></SelectCategory>
        <NoteList category={selectedCategory} />
      </Stack>
      <Box width="350px">
        <Button onClick={() => setSlimListOpen(!slimListOpen)}>
          Open List
        </Button>
        {slimListOpen && <SlimNoteList />}
      </Box>
    </UiAppLayout>
  );
}

export default App;
