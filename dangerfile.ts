import { danger, warn, fail } from "danger";

const coverageSummary = require("./coverage/coverage-summary.json").total.lines;
if (coverageSummary.pct < 90) {
  fail(`❌ Test coverage dropped to ${coverageSummary.pct}%. Please add tests to bring it back up.`);
}

danger.git.created_files.forEach((f) => {
  if (f.startsWith("src/") && /\.(ts|js)x?$/.test(f)) {
    const testFile = f
      .replace(/^src\//, "tests/unit/")
      .replace(/\.(ts|js)x?$/, ".test.$1");
    if (!danger.git.fileMatch(testFile).edited) {
      warn(`🧪 No tests found for new module \`${f}\`. Consider adding \`${testFile}\`.`);
    }
  }
});
