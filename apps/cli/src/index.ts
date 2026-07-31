#!/usr/bin/env node

import { Command } from 'commander';
import axios from 'axios';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import readline from 'readline';

const program = new Command();
const CONFIG_PATH = path.join(os.homedir(), '.pastebin-config.json');
const API_URL = process.env.PASTEBIN_API_URL || 'http://localhost:5000/api';

// Helper to load JWT configuration
async function loadToken(): Promise<string | null> {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(data);
    return config.token || null;
  } catch {
    return null;
  }
}

// Helper to save JWT configuration
async function saveToken(token: string) {
  try {
    await fs.writeFile(CONFIG_PATH, JSON.stringify({ token }, null, 2), 'utf-8');
  } catch (error: any) {
    console.error(chalk.red(`Failed to save config file: ${error.message}`));
  }
}

// Helper to prompt user input
function askQuestion(query: string, isPassword = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// CLI Config setup
program
  .name('pastebin')
  .description('PasteBin Code Sharing CLI Client')
  .version('1.0.0');

// Login Command
program
  .command('login')
  .description('Authenticate with PasteBin API and retrieve JWT session token')
  .action(async () => {
    try {
      console.log(chalk.blue('--- Authenticate with PasteBin ---'));
      const email = await askQuestion('Enter your email: ');
      const password = await askQuestion('Enter your password: ');

      if (!email || !password) {
        console.log(chalk.red('Email and password are required.'));
        return;
      }

      console.log(chalk.yellow('Logging in...'));
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      const { token } = response.data;
      await saveToken(token);
      console.log(chalk.green('✓ Authentication successful! Session token saved.'));
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      console.error(chalk.red(`✗ Login failed: ${msg}`));
    }
  });

// Upload Command
program
  .command('upload <file>')
  .description('Upload a local file content as a new paste')
  .option('-t, --title <title>', 'Title of the paste')
  .option('-l, --language <language>', 'Programming language (e.g. javascript, python, rust)', 'plaintext')
  .option('-p, --private', 'Create a private paste', false)
  .option('--password <password>', 'Protect the paste with a password')
  .action(async (file, options) => {
    try {
      // Read local file
      const absolutePath = path.resolve(file);
      const content = await fs.readFile(absolutePath, 'utf-8');

      // Title default to file name if not provided
      const title = options.title || path.basename(file);
      const language = options.language.toLowerCase();
      const isPublic = !options.private;
      const password = options.password || undefined;

      const token = await loadToken();
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(chalk.yellow('Uploading paste...'));
      const response = await axios.post(
        `${API_URL}/pastes`,
        {
          title,
          content,
          language,
          isPublic,
          password,
        },
        { headers }
      );

      const paste = response.data;
      console.log(chalk.green('✓ Paste successfully uploaded!'));
      console.log(chalk.cyan(`ID:        ${paste.id}`));
      console.log(chalk.cyan(`URL:       http://localhost:5173/paste/${paste.id}`));
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      console.error(chalk.red(`✗ Upload failed: ${msg}`));
    }
  });

// Get Command
program
  .command('get <id>')
  .description('Retrieve paste content by ID')
  .option('--password <password>', 'Password for protected pastes')
  .action(async (id, options) => {
    try {
      const token = await loadToken();
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(chalk.yellow('Fetching paste...'));
      
      let response;
      try {
        response = await axios.get(`${API_URL}/pastes/${id}`, { headers });
      } catch (err: any) {
        if (err.response?.status === 401 && err.response?.data?.message?.includes('Password required')) {
          const pass = options.password || await askQuestion('This paste is password protected. Enter password: ');
          const verifyResp = await axios.post(`${API_URL}/pastes/${id}/verify`, { password: pass });
          const tempToken = verifyResp.data.token;
          headers['Authorization'] = `Bearer ${tempToken}`;
          response = await axios.get(`${API_URL}/pastes/${id}`, { headers });
        } else {
          throw err;
        }
      }

      const paste = response.data;
      console.log(chalk.bold.green(`=== ${paste.title} (${paste.language}) ===`));
      console.log(chalk.gray(`Created: ${new Date(paste.createdAt).toLocaleString()}`));
      console.log(chalk.gray('-'.repeat(40)));
      
      const lines = paste.content.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
          console.log(chalk.gray(line));
        } else {
          console.log(line);
        }
      }
      console.log(chalk.gray('-'.repeat(40)));
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      console.error(chalk.red(`✗ Fetch failed: ${msg}`));
    }
  });

// List Command
program
  .command('list')
  .description('List recent public pastes')
  .action(async () => {
    try {
      console.log(chalk.yellow('Retrieving public pastes...'));
      const response = await axios.get(`${API_URL}/pastes?page=1&limit=10`);
      const { pastes } = response.data;

      if (!pastes || pastes.length === 0) {
        console.log(chalk.blue('No public pastes found.'));
        return;
      }

      console.log(chalk.bold.magenta('\nRecent Public Pastes'));
      console.log(chalk.gray('=' .repeat(60)));
      console.log(
        `${chalk.bold('ID').padEnd(12)} | ${chalk.bold('Title').padEnd(25)} | ${chalk.bold('Language').padEnd(12)} | ${chalk.bold('Password')}`
      );
      console.log(chalk.gray('=' .repeat(60)));

      for (const paste of pastes) {
        const idCol = paste.id.substring(0, 10).padEnd(12);
        const titleCol = (paste.title || 'Untitled').substring(0, 23).padEnd(25);
        const langCol = (paste.language || 'plaintext').padEnd(12);
        const passCol = paste.hasPassword ? chalk.red('Yes') : chalk.green('No');
        console.log(`${idCol} | ${titleCol} | ${langCol} | ${passCol}`);
      }
      console.log(chalk.gray('=' .repeat(60)) + '\n');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      console.error(chalk.red(`✗ List failed: ${msg}`));
    }
  });

program.parse(process.argv);
