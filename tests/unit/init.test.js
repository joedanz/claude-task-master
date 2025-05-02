import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

import {
	createProjectStructure,
	copyTemplateFile,
	setupMCPConfiguration,
	DEFAULT_CONFIG
} from '../../scripts/init.js';

jest.mock('child_process', () => ({
	execSync: jest.fn()
}));

const mockFs = {
	existsSync: jest.fn(),
	writeFileSync: jest.fn(),
	mkdirSync: jest.fn(),
	copyFileSync: jest.fn(),
	readFileSync: jest.fn(),
	constants: fs.constants
};
jest.mock('fs', () => mockFs);

const mockPath = {
	join: path.join,
	resolve: jest.fn(),
	dirname: jest.fn(),
	basename: path.basename
};
jest.mock('path', () => mockPath);

jest.mock('console', () => ({
	log: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
	clear: jest.fn()
}));

describe('Project Initialization', () => {
	let tempDir;

	beforeEach(() => {
		jest.clearAllMocks();

		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-master-init-test-'));

		mockFs.existsSync.mockReset();
		mockFs.writeFileSync.mockReset();
		mockFs.mkdirSync.mockReset();
		mockFs.copyFileSync.mockReset();
		mockFs.readFileSync.mockReset();

		mockFs.existsSync.mockReturnValue(false);
		mockPath.resolve.mockImplementation((...args) => path.resolve(...args));
		mockPath.dirname.mockImplementation((p) => path.dirname(p));

		mockFs.readFileSync.mockImplementation((filePath) => {
			if (filePath.includes('templates')) {
				const fileName = path.basename(filePath);
				if (fileName === 'config.yaml') return yaml.dump(DEFAULT_CONFIG);
				return `Template content for ${fileName}`;
			}
			throw new Error(`Unexpected readFileSync call: ${filePath}`);
		});
	});

	afterEach(() => {
		try {
			fs.rmSync(tempDir, { recursive: true, force: true });
		} catch (err) {
			console.error(`Error cleaning up: ${err.message}`);
		}
	});

	test('createProjectStructure should create .taskmaster dir and config.yaml', () => {
		const projectName = 'my-new-project';
		const projectPath = path.join(tempDir, projectName);
		const configDirPath = path.join(projectPath, '.taskmaster');
		const configFilePath = path.join(configDirPath, 'config.yaml');

		createProjectStructure(projectPath);

		expect(mockFs.mkdirSync).toHaveBeenCalledWith(configDirPath, {
			recursive: true
		});
		expect(mockFs.writeFileSync).toHaveBeenCalledWith(
			configFilePath,
			yaml.dump(DEFAULT_CONFIG)
		);
	});

	test('copyTemplateFile should handle .windsurfrules creation', () => {
		const targetPath = path.join(tempDir, '.windsurfrules');
		mockFs.existsSync.mockReturnValue(false);
		mockFs.readFileSync.mockReturnValue('Windsurf Rule Template Content');

		copyTemplateFile('.windsurfrules', targetPath);

		expect(mockFs.writeFileSync).toHaveBeenCalledWith(
			targetPath,
			'Windsurf Rule Template Content'
		);
	});
});

describe('MCP Configuration Handling', () => {
	let tempDir;

	beforeEach(() => {
		jest.clearAllMocks();
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-master-mcp-test-'));

		// Reset mocks (using the same mockFs/mockPath objects)
		mockFs.existsSync.mockReset();
		mockFs.writeFileSync.mockReset();
		mockFs.mkdirSync.mockReset();
		mockFs.readFileSync.mockReset();
		mockPath.resolve.mockImplementation((...args) => path.resolve(...args));
		mockPath.dirname.mockImplementation((p) => path.dirname(p));

		// Default mocks relevant to MCP setup
		mockFs.existsSync.mockReturnValue(false); // Default: .cursor and mcp.json don't exist
	});

	afterEach(() => {
		try {
			fs.rmSync(tempDir, { recursive: true, force: true });
		} catch (err) {
			console.error(`Error cleaning up MCP test dir: ${err.message}`);
		}
	});

	test('creates .cursor directory and mcp.json when they do not exist', () => {
		// Arrange
		const cursorDirPath = path.join(tempDir, '.cursor');
		const mcpJsonPath = path.join(cursorDirPath, 'mcp.json');
		mockFs.existsSync.mockReturnValue(false); // Ensure neither exists

		// Act
		setupMCPConfiguration(tempDir, 'test-project'); // Call REAL function

		// Assert
		expect(mockFs.mkdirSync).toHaveBeenCalledWith(cursorDirPath, {
			recursive: true
		});
		expect(mockFs.writeFileSync).toHaveBeenCalledWith(
			mcpJsonPath,
			expect.stringContaining('"task-master-ai":') // Check if our server is added
		);
		expect(mockFs.writeFileSync).toHaveBeenCalledWith(
			mcpJsonPath,
			expect.stringContaining('\"command\": \"npx\"') // Check for npx command
		);
	});

	test('updates existing mcp.json by adding new server', () => {
		// Arrange
		const cursorDirPath = path.join(tempDir, '.cursor');
		const mcpJsonPath = path.join(cursorDirPath, 'mcp.json');
		const existingMCPConfig = {
			mcpServers: { 'existing-server': { command: 'node' } }
		};
		mockFs.existsSync.mockImplementation(
			(p) => p === cursorDirPath || p === mcpJsonPath
		);
		mockFs.readFileSync.mockReturnValueOnce(JSON.stringify(existingMCPConfig));

		// Act
		setupMCPConfiguration(tempDir, 'test-project');

		// Assert
		expect(mockFs.mkdirSync).not.toHaveBeenCalled(); // Dir exists
		expect(mockFs.writeFileSync).toHaveBeenCalledWith(
			mcpJsonPath,
			expect.stringContaining('"existing-server":') // Preserves existing
		);
		expect(mockFs.writeFileSync).toHaveBeenCalledWith(
			mcpJsonPath,
			expect.stringContaining('"task-master-ai":') // Adds new
		);
	});

	test('handles mcp.json parsing error by creating new valid file', () => {
		// Arrange
		const cursorDirPath = path.join(tempDir, '.cursor');
		const mcpJsonPath = path.join(cursorDirPath, 'mcp.json');
		mockFs.existsSync.mockImplementation(
			(p) => p === cursorDirPath || p === mcpJsonPath
		);
		mockFs.readFileSync.mockReturnValueOnce('{ invalid json'); // Invalid JSON

		// Act
		setupMCPConfiguration(tempDir, 'test-project');

		// Assert
		expect(mockFs.writeFileSync).toHaveBeenCalledWith(
			mcpJsonPath,
			expect.stringContaining('"task-master-ai":') // Creates new with our server
		);
		expect(mockFs.writeFileSync).toHaveBeenCalledWith(
			mcpJsonPath,
			expect.not.stringContaining('{ invalid json') // Does not write invalid json
		);
	});

	test('does not modify existing task-master-ai server configuration', () => {
		// Arrange
		const cursorDirPath = path.join(tempDir, '.cursor');
		const mcpJsonPath = path.join(cursorDirPath, 'mcp.json');
		const existingMCPConfig = {
			mcpServers: {
				'task-master-ai': { command: 'custom', args: ['--port=9000'] }
			}
		};
		mockFs.existsSync.mockImplementation(
			(p) => p === cursorDirPath || p === mcpJsonPath
		);
		mockFs.readFileSync.mockReturnValueOnce(JSON.stringify(existingMCPConfig));

		// Act
		setupMCPConfiguration(tempDir, 'test-project');

		// Assert
		// Check the actual content written
		expect(mockFs.writeFileSync).toHaveBeenCalledTimes(1);
		const writtenContent = mockFs.writeFileSync.mock.calls[0][1];
		const writtenJSON = JSON.parse(writtenContent);
		expect(writtenJSON.mcpServers['task-master-ai'].command).toBe('custom');
		expect(writtenJSON.mcpServers['task-master-ai'].args).toEqual([
			'--port=9000'
		]);
	});
});
