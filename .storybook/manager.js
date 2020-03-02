import { configureActions } from "@storybook/addon-actions";

configureActions({
  depth: 100,
  // Limit the number of items logged into the actions panel
  clearOnStoryChange: true,
  limit: 50
});
