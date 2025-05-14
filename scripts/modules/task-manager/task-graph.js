// ESM module: Generates a Mermaid task dependency graph from tasks.json
import fs from 'fs';
import path from 'path';

/**
 * Generate a Mermaid diagram of the task dependency graph.
 * @param {Object} options - CLI options
 * @param {string} options.input - Input tasks.json path
 * @param {string} options.output - Output file path (default: tasks/taskgraph.md)
 * @param {string} [options.status] - Optional status filter
 * @param {string} [options.id] - Optional comma-separated list of task/subtask IDs to include
 */
export async function generateTaskGraph({
	input,
	output,
	status,
	id,
	subtasks = true
}) {
	// Defaults
	const inputFile = input || 'tasks/tasks.json';
	const outputFile = output || 'tasks/taskgraph.md';

	if (!fs.existsSync(inputFile)) {
		throw new Error(`Input file not found: ${inputFile}`);
	}

	// Read and parse tasks.json
	const tasksData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
	const tasks = Array.isArray(tasksData) ? tasksData : tasksData.tasks || [];

	// Flatten tasks and subtasks into a single map
	const allTasks = {};
	for (const task of tasks) {
		const tid = String(task.id);
		allTasks[tid] = { ...task, id: tid, parentId: null };
		if (subtasks && Array.isArray(task.subtasks)) {
			for (const sub of task.subtasks) {
				const subId = `${tid}.${sub.id}`;
				allTasks[subId] = {
					...sub,
					id: subId,
					parentId: tid,
					status: sub.status || task.status
				};
			}
		}
	}

	// Filtering
	let filteredIds = Object.keys(allTasks);
	if (status) {
		filteredIds = filteredIds.filter(
			(tid) =>
				(allTasks[tid].status || '').toLowerCase() === status.toLowerCase()
		);
	}
	if (id) {
		const idSet = new Set(id.split(',').map((s) => s.trim()));
		if (subtasks) {
			// For each top-level task ID, add all its subtasks
			const expandedIds = new Set();
			for (const rawId of idSet) {
				if (allTasks[rawId] && !allTasks[rawId].parentId) {
					// It's a top-level task, add it and all its subtasks
					expandedIds.add(rawId);
					for (const tid of Object.keys(allTasks)) {
						if (allTasks[tid].parentId === rawId) {
							expandedIds.add(tid);
						}
					}
				} else if (allTasks[rawId]) {
					// It's a subtask, just add it
					expandedIds.add(rawId);
				}
			}
			filteredIds = filteredIds.filter((tid) => expandedIds.has(tid));
		} else {
			filteredIds = filteredIds.filter((tid) => idSet.has(tid));
		}
	}

	// Mermaid diagram
	let mermaid = '```mermaid\ngraph TD\n';
	// Node style map
	const styleMap = {
		done: 'fill:#c8e6c9,stroke:#388e3c,stroke-width:2px',
		pending: 'fill:#fff9c4,stroke:#fbc02d,stroke-width:2px',
		deferred: 'fill:#ffe0b2,stroke:#f57c00,stroke-width:2px',
		default: 'fill:#e3e3e3,stroke:#616161,stroke-width:1px'
	};

	// Generate nodes
	for (const tid of filteredIds) {
		const t = allTasks[tid];
		const label = `${tid}: ${t.title ? t.title.replace(/"/g, '\\"') : ''}`;
		mermaid += `${tid}[\"${label}\"]\n`;
	}
	// Generate edges
	for (const tid of filteredIds) {
		const t = allTasks[tid];
		if (Array.isArray(t.dependencies)) {
			for (const dep of t.dependencies) {
				const depId = String(dep);
				// Only draw edge if dependency is in filteredIds
				if (filteredIds.includes(depId)) {
					mermaid += `${depId} --> ${tid}\n`;
				}
			}
		}
		// Subtasks: draw edge from parent to subtask
		if (subtasks && t.parentId && filteredIds.includes(t.parentId)) {
			mermaid += `${t.parentId} --> ${tid}\n`;
		}
	}
	// Style nodes
	for (const tid of filteredIds) {
		const t = allTasks[tid];
		const s = styleMap[(t.status || '').toLowerCase()] || styleMap.default;
		mermaid += `style ${tid} ${s}\n`;
	}
	mermaid += '```\n';

	// Ensure output directory exists
	const outDir = path.dirname(outputFile);
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir, { recursive: true });
	}
	fs.writeFileSync(outputFile, mermaid, 'utf8');
}
