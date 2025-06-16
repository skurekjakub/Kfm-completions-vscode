import { AttributeDataType } from "../../common/types";
import { HeaderAttribute } from "../types";

export const tocAttributeDefinition: HeaderAttribute =
{
    name: 'toc',
    required: false,
    description: 'Table of Contents configuration.',
    dataType: AttributeDataType.Object,
    attributes: [
      {
          name: 'minHeadingLevel',
          required: true, // Assuming optional
          description: 'Minimum heading level to include (e.g., 2 for H2).',
          dataType: AttributeDataType.Number,
          values: [1, 2, 3, 4, 5, 6]
          // Add values or loader if specific levels (e.g., 1-6) should be suggested
      },
      {
          name: 'maxHeadingLevel',
          required: true, // Assuming optional
          description: 'Maximum heading level to include (e.g., 4 for H4).',
          dataType: AttributeDataType.Number,
          values: [1, 2, 3, 4, 5, 6]
          // Add values or loader if specific levels (e.g., 1-6) should be suggested
      }
  ]
};