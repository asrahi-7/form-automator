export async function fetchFormStructure(formUrl: string) {
  try {
    const response = await fetch(formUrl);
    const html = await response.text();

    const match = html.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*\]);/s);
    if (!match) {
      throw new Error("Could not find form data. Make sure it is a public Google Form URL.");
    }

    const rawData = JSON.parse(match[1]);
    const title = rawData[1][8] || "Untitled Form";
    const description = rawData[1][0] || "";
    const googleFormId = rawData[14] || "unknown-id";

    const rawItems = rawData[1][1] || [];
    const questions = rawItems
      .filter((item: any) => item[3] !== 8) // Filter out simple page/section breaks
      .map((item: any) => {
        const type = item[3];

        // Type 7 = Multiple-choice Grid, Type 9 = Checkbox Grid
        if (type === 7 || type === 9) {
          // Grids have multiple rows, each row acts as its own separate input
          const rows = item[4]?.map((row: any) => ({
            rowId: row[0],
            entryKey: `entry.${row[0]}`,
            label: row[3]?.[0] || "",
            required: row[2] === 1
          })) || [];

          // The columns (options) are usually shared across all rows
          const options = item[4]?.[0]?.[1]?.map((opt: any) => opt[0]) || [];

          return {
            id: item[0],
            title: item[1],
            type: type,
            rows: rows,
            options: options,
            required: false // Requirements are per-row for grids
          };
        } else {
          // Standard questions
          const questionId = item[4]?.[0]?.[0];
          const options = item[4]?.[0]?.[1]?.map((opt: any) => opt[0]) || [];

          return {
            id: item[0],
            entryKey: questionId ? `entry.${questionId}` : null,
            title: item[1],
            type: type,
            options: options,
            required: item[4]?.[0]?.[2] === 1
          };
        }
      })
      .filter((q: any) => q.entryKey !== null || (q.rows && q.rows.length > 0)); // Keep valid questions and grids

    return { title, description, googleFormId, questions };
  } catch (error) {
    console.error("Parser Error:", error);
    throw new Error("Failed to parse the Google Form.");
  }
}