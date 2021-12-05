import { UiAppLayout } from "./shared-ui/UiAppLayout";
import { Box, Button, Stack } from "@chakra-ui/react";
import { NoteList } from "./NoteList";
import { useState } from "react";
import { SelectCategory } from "./SelectCategory";
import { SlimNoteList } from "./SlimNotesList";
import { Route } from "react-router";
import { EditNote } from "./EditNote";
import { EditCategories } from "./EditCategories";

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
        <EditCategories />
        <NoteList category={selectedCategory} />
        <Box width="350px">
          <Button onClick={() => setSlimListOpen(!slimListOpen)}>
            Open List
          </Button>
          {slimListOpen && <SlimNoteList />}
        </Box>
      </Stack>
      <Route path={`/note/:noteId`}>
        <EditNote />
      </Route>
    </UiAppLayout>
  );
}

export default App;
