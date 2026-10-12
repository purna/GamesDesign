# Research learning tools v3

Open [index.html](index.html#menu) for the shared library: the menu, all 13 research methods, 13 detailed activity studios and 24 reading summaries share the same page. The folder also contains 13 standalone HTML activities maintained in this folder. Keep the JavaScript and CSS folders alongside it when copying or hosting the app.

## Activity links

[Open the research library menu](index.html#menu)

Use the library link to keep the shared menu and reading summaries, or open the copied HTML activity on its own.

| Activity | Research library | Standalone activity |
| --- | --- | --- |
| 01. Online surveys — Survey Lab | [Open in library](index.html#surveys) | [Open activity](Activity_01_Online_Surveys_-_Survey_Lab.html) |
| 02. Task analysis — Join a Match | [Open in library](index.html#task-analysis) | [Open activity](Activity_02_Task_Analysis_-_Join_A_Match.html) |
| 03. Prototyping Lab — Tutorial Flow | [Open in library](index.html#prototyping) | [Open activity](Activity_03_Prototyping_Lab__Tutorial_Flow.html) |
| 04. Persona Maker — Esports Event App | [Open in library](index.html#personas) | [Open activity](Activity_04_Persona_Maker__Esports_Event_App.html) |
| 05. Parallel design — Login Page Sprint | [Open in library](index.html#parallel-design) | [Open activity](Activity_05_Parallel_Design_-_Home_Screen_Sprint.html) |
| 06. Interviews — Peer Experience Lab | [Open in library](index.html#interviews) | [Open activity](Activity_06_Interviews_-_Peer_Experience_Lab.html) |
| 07. Expert Review Lab — UI Audit & Triage | [Open in library](index.html#expert-review) | [Open activity](Activity_07_Expert_Review_Lab__UI_Audit_Triage.html) |
| 08. Focus groups — Classroom Discussion | [Open in library](index.html#focus-groups) | [Open activity](Activity_08_Focus_Groups_-_Classroom_Discussion.html) |
| 09. First Click Lab — Neon Clash Weekend | [Open in library](index.html#first-click) | [Open activity](Activity_09_First_Click_Lab__Neon_Clash_Weekend.html) |
| 10. Card sorting — Esports Event App | [Open in library](index.html#card-sorting) | [Open activity](Activity_10_Card_Sorting_-_Esports_Event_with_Tutorial.html) |
| 11. Contextual interviews — Study Session | [Open in library](index.html#contextual-interviews) | [Open activity](Activity_11_Contextual_Interviews_-_Study_Session.html) |
| 12. Usability Testing Lab — Practice Session | [Open in library](index.html#usability-testing) | [Open activity](Activity_12_Usability_Testing_Lab__Practice_Session.html) |
| 13. Use Case Arena — Neon Clash Weekend | [Open in library](index.html#use-cases) | [Open activity](Activity_13_Use_Case_Arena__Neon_Clash_Weekend.html) |

The standalone activities are the source files for refreshing the library. They save separately from the embedded library studios; use the relevant activity’s backup/export menu when moving work.

## Presentation links

Use `index.html#menu` or a method destination such as `index.html#personas`, `index.html#card-sorting`, `index.html#first-click` or `index.html#use-cases`. [PRESENTATION-LINKS.md](PRESENTATION-LINKS.md) lists all destinations. Browser Back and the Research menu link return to the menu.

## Content and code

- `index.html`: the page shell and inert templates for the detailed tasks. The library embeds its tasks without iframes; the copied standalone HTML activities are also available through the links above.
- `data/methods/<method>.js`: one lesson record per research method.
- `activities/<method>/content.js`: task configuration, tabs, prompts, readings, examples and tutorial data.
- `activities/<method>/task.js`: the task's controls, visuals, saving and exports, mounted only when that method is selected.
- `activities/<method>/style.css`: scoped task styling.
- `summaries/data/<source>.js`: one detailed summary record per source.
- `summaries/catalog.js`: original source URLs and summary identifiers.
- `shared/summary-popup.js`: one in-page summary dialog, including speech, printing and text downloads.
- `shared/task-scope.js`: isolates task controls and styles within the shared document and cleans up listeners when switching tasks.
- `shared/studios.js`: task mounting, portfolio reports and combined backups.
- `shared/menu.js`: menu and direct section navigation.
- `shared/prototyping.js`: prototype builder.
- `legacy/widgets-v2.js`: older widgets retained for reference and not loaded.

All 13 activity studios are synchronised from the latest HTML files in this folder. This includes the Survey Lab pipeline, Prototyping v11 with Bug Hunt Theory, Parallel Design v6 login sprint, Expert Review inspector, and the updated Card Sorting, First Click, Persona Maker and Use Case activities. The original source files remain unchanged. Menu descriptions and lesson times follow the source activity configuration.

## Saving and exports

Existing activity storage keys remain compatible with the previous library version. Each activity retains its own source schema version (including prototype version 11 and parallel-design version 6); combined backup validation accepts supported versions for all 13 studios. Library drafts use `research-lab-v1`; detailed tasks use `research-v3-<method>-` keys. Combined version-2 backups include the studios and readable reports. Version-1 library backups still import without clearing studio work.

Each task has its Export menu. The summaries can be read aloud, downloaded as text, or printed/saved as PDF. Summary printouts and task printouts use the active content in this same page. Browser speech/dictation support varies. Optional PowerPoint and PDF export libraries require internet access; text, JSON and Word export do not rely on them.

No build step or fetched JSON is required: classic scripts allow local-file use. Some browsers restrict storage or other features for local files; a local web server or existing hosting avoids those restrictions. Download a backup before changing devices.

## Replacement sections

All 13 methods use their latest source tasks as the entire section. The earlier generic Plan/Create/Refine forms, reading sidebar and design-reflection fields are not shown or included in their portfolio reports. Each example keeps its own tutorial, task tabs, one Reflect tab, readings and Export menu. A single library accessibility toolbar controls colour theme, text size and reading font for all sections. Previous generic drafts remain in backups for recovery.

Every method now uses the same Persona-format activity header: ACTIVITY n / 13, research-method tag, title, italic subtitle and tutorial button. The existing Persona tutorial and Card Sorting Tutorial tab are preserved; other tutorials show the instructions from that method’s task data.

## Refreshing from the standalone activities

Run `python3 tools/sync-research.py` from this folder (Python 3 and Node.js are needed only for refreshing, not for using the library). It updates activity configuration, task scripts, scoped CSS, inert page templates, menu descriptions and durations. `data/research-sources.json` records the source filenames and their SHA-256 hashes. The shared menu, summary popup, accessibility controls and existing storage prefixes stay in place.

Task callbacks and inspector timers are isolated and disposed when switching activities. This prevents old inspectors from continuing to run in the background. Structured widget records, including expert-review findings, are retained when reopening a task.
