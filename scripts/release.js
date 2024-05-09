const {execSync} = require('child_process');
const util = require('util');
// 改为异步：包裹返回promise

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const exec = util.promisify(require('child_process').exec);

const projectRootPath = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRootPath, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageName = packageJson.name;

/**
 * 解析版本号
 * @param {*} version
 * @returns
 */
function parseVersion(version) {
	const [semver, preReleaseTag = ''] = version.split('-');
	const [major, minor, patch] = semver.split('.').map(Number);
	const [preReleaseLabel, preReleaseVersion] = preReleaseTag.split('.');
	return {
		major,
		minor,
		patch,
		preReleaseLabel,
		preReleaseVersion: preReleaseVersion ? parseInt(preReleaseVersion, 10) : 0,
	};
}

/**
 * 检测是否是预发布版本
 * @param {*} version
 */
function isPreRelease(version) {
	return /-/.test(version);
}

/**
 * 获取预发布版本号
 * @param {*} currentVersion
 * @param {*} type
 */
function getPreReleaseVersion(currentVersion, type) {
	let {major, minor, patch, preReleaseLabel, preReleaseVersion} =
		currentVersion;
	switch (type) {
		case 'prepatch':
			patch += 1;
			return `${major}.${minor}.${patch}-0`;
		case 'preminor':
			minor += 1;
			return `${major}.${minor}.0-0`;
		case 'premajor':
			major += 1;
			return `${major}.0.0-0`;
		case 'prerelease':
			if (isPreRelease(`${major}.${minor}.${patch}`)) {
				preReleaseVersion = preReleaseVersion || 0;
				return `${major}.${minor}.${patch}-${preReleaseLabel || 'beta'}.${preReleaseVersion + 1}`;
			} else {
				return `${major}.${minor}.${patch}-beta.0`;
			}
		default:
			throw new Error(`❌ 不支持的预发布版本类型: ${type}`);
	}
}

/**
 * 获取最新版本号
 * @returns Promise
 */
async function getLatestVersion() {
	try {
		const {stdout} = await exec(`npm show ${packageName} version`);
		const latestVersion = stdout.trim().replace(/^v/, ''); // 删除可能存在的前导 v
		return latestVersion;
	} catch (error) {
		console.error(`❌ 获取最新版本失败: ${error.message}`);
		throw error; // 抛出错误，以便可以在调用此函数的地方捕获并处理
	}
}

/**
 * 更新版本号
 * @param {*} newVersion
 */
function updateVersion(newVersion) {
	packageJson.version = newVersion;
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
	console.log(`✅ 版本号已更新为 ${newVersion}`);
}

/**
 * 确保用户已登录npm
 * @returns {Promise<string>} 返回已登录用户的名称或抛出错误
 */
async function ensureNpmLoggedIn() {
	try {
		const {stdout} = await exec('npm whoami');
		console.log(`✅ 检测到您已作为${stdout.trim()}登录到npm`);
		return stdout.trim();
	} catch (error) {
		console.error('❌ 您似乎还没有登录到npm。请登录后继续。');
		const answers = await inquirer.prompt([
			{
				type: 'input',
				name: 'username',
				message: '请输入您的npm用户名:',
			},
			{
				type: 'password',
				name: 'password',
				message: '请输入您的npm密码:',
			},
			{
				type: 'input',
				name: 'email',
				message: '请输入您的npm邮箱地址:',
			},
		]);

		// 以下操作依赖于能够自动化的输入命令到npm login（在这个假设下编写）
		// 实际操作中这可能需要特殊处理，例如通过node-pty实现自动输入
		const {stdout: loginStdout} = await exec(
			`echo "${answers.username}\n${answers.password}\n${answers.email}\n" | npm login`,
		);
		console.log('✅ 登录输出流loginStdout', loginStdout);
		return answers.username;
	}
}

/**
 * 异步地发布到npm
 * @returns {Promise<void>}
 */
async function publishToNpm() {
	console.log('🚀🚀🚀 正在发布到 npm...');

	try {
		// 这里可以添加对newVersion的使用，例如修改package.json中的版本号
		// 如果newVersion参数确实需要被用于发布特定版本，这里应该加入对版本号处理的逻辑
		// 例如使用 npm version 命令来更新项目的版本号

		const {stdout, stderr} = await exec('npm publish');

		if (stderr) {
			console.log(`✅ 发布输出流stderr: ${stderr}`);
		}

		console.log(`🎉🎉🎉 npm包发布成功: ${stdout}`);
	} catch (error) {
		console.error(`❌ 发布失败: ${error.message}`);
		throw error; // 抛出错误以供调用方处理
	}
}

/**
 * 标记tag
 * @param {*} newVersion
 */
function gitOperations(newVersion) {
	try {
		process.chdir(projectRootPath); // Change the current working directory to project root

		// 获取当前分支名称
		const branchName = execSync('git rev-parse --abbrev-ref HEAD')
			.toString()
			.trim();

		// 检查是否有设置 upstream（远程跟踪分支）
		let setUpstream = false;
		try {
			execSync(`git rev-parse --abbrev-ref --symbolic-full-name @{u}`);
		} catch (error) {
			// 如果没有设置 upstream，为远程的同名分支设置 upstream
			const remoteBranchExists = execSync(
				`git ls-remote --heads origin ${branchName}`,
			)
				.toString()
				.trim();
			if (remoteBranchExists) {
				execSync(`git branch --set-upstream-to=origin/${branchName}`);
			} else {
				console.error(
					`❌ 远程分支 'origin/${branchName}' 不存在，无法设置 upstream。`,
				);
				return;
			}
			setUpstream = true;
		}

		execSync(`git add .`, {stdio: 'inherit'});
		execSync(`git commit -m "chore(release): ${newVersion}"`, {
			stdio: 'inherit',
		});
		execSync(`git tag v${newVersion}`, {stdio: 'inherit'});

		// 推送改动到远程分支
		execSync(`git push`, {stdio: 'inherit'});
		if (setUpstream) {
			// 如果之前没有 upstream，并且我们为其设置了 upstream，现在也推送它
			execSync(`git push --set-upstream origin ${branchName}`, {
				stdio: 'inherit',
			});
		}
		// 推送tag到远程
		execSync(`git push origin v${newVersion}`, {stdio: 'inherit'});

		console.log(`✅ Git tag v${newVersion} 已标记`);
	} catch (error) {
		console.error(`❌ Git 操作失败: ${error.message}`);
	}
}

/**
 * 设置npm的registry到指定的URL，并返回旧的registry
 * @returns {Promise<string>} 当成功时返回旧的registry URL
 */
async function setNpmRegistry() {
	try {
		const {stdout: getRegistryStdout} = await exec(`npm config get registry`);
		const oldNpmRegistry = getRegistryStdout.trim();

		const NPM_REGISTRY_URL = 'https://registry.npmjs.org/';
		await exec(`npm config set registry ${NPM_REGISTRY_URL}`);

		console.log(`✅ npm registry已设置为: ${NPM_REGISTRY_URL}`);
		return oldNpmRegistry; // 返回旧的registry，以便后续可以恢复
	} catch (error) {
		if (error.stdout) {
			console.error(`❌ 设置npm registry stdout输出流: ${error.stdout}`);
		}
		if (error.stderr) {
			console.error(`❌ 设置npm registry stderr出错: ${error.stderr}`);
		}
		console.error(`❌ 设置npm registry中发生错误: ${error.message}`);
		throw error; // 抛出错误以供调用者处理
	}
}

/**
 * 恢复npm的registry为旧的URL
 * @returns {Promise<void>}
 */
async function restoreNpmRegistry(oldNpmRegistry) {
	if (oldNpmRegistry) {
		try {
			await exec(`npm config set registry ${oldNpmRegistry}`);
			console.log(`✅ npm registry已恢复为: ${oldNpmRegistry}`);
		} catch (error) {
			if (error.stdout) {
				console.error(`✅ 恢复npm registry输出流: ${error.stdout}`);
			}
			if (error.stderr) {
				console.error(`❌ 恢复npm registry出错: ${error.stderr}`);
			}
			console.error(`❌ 恢复npm registry中发生错误: ${error.message}`);
			throw error; // 抛出错误以供调用方处理
		}
	} else {
		console.error(`❌ 未找到旧的npm registry，无法恢复。`);
		throw new Error(`❌ 未找到旧的npm registry，无法恢复。`);
	}
}

/**
 * 命令行显示逻辑
 * @param {*} latestVersion
 */
async function displayOptions(latestVersion) {
	console.log('✅ 发包脚本启动【自动更新版本号、自动发布到npm】');
	console.log('!!! 使用前请确保仓库内已经是可发布状态');
	const currentVersion = parseVersion(latestVersion);
	const choices = [
		{
			name: `Major【大版本】 (${parseInt(currentVersion.major) + 1}.0.0)`,
			value: 'major',
		},
		{
			name: `Minor【小版本】 (${currentVersion.major}.${parseInt(currentVersion.minor) + 1}.0)`,
			value: 'minor',
		},
		{
			name: `Patch【修订版本】 (${currentVersion.major}.${currentVersion.minor}.${parseInt(currentVersion.patch) + 1})`,
			value: 'patch',
		},
		{name: `Prepatch【预发修订版本】`, value: 'prepatch'},
		{name: `Preminor【预发小版本】`, value: 'preminor'},
		{name: `Premajor【预发大版本】`, value: 'premajor'},
		{name: `Prerelease【预发版】`, value: 'prerelease'},
		{name: `Specific version【指定版本】`, value: 'specific'},
	];

	inquirer
		.prompt([
			{
				type: 'list',
				name: 'releaseType',
				message: '请选择版本号的更新类型:',
				choices: choices,
			},
			{
				type: 'input',
				name: 'specificVersion',
				message: '输入具体的版本号:',
				when: (answers) => answers.releaseType === 'specific',
				validate: (input) =>
					/\d+\.\d+\.\d+(-\w+\.\d+)?/.test(input) ||
					'版本号必须符合语义化版本控制规范。',
			},
		])
		.then(async (answers) => {
			let newVersion = '';
			// 指定版本号
			if (answers.releaseType === 'specific') {
				newVersion = answers.specificVersion;
			} else if (['major', 'minor', 'patch'].includes(answers.releaseType)) {
				// 非预发版本
				currentVersion[answers.releaseType]++;
				newVersion = `${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`;
			} else {
				// 预发布版本
				newVersion = getPreReleaseVersion(currentVersion, answers.releaseType);
			}
			// 更新版本号
			updateVersion(newVersion);
			// git增加tag并提交
			gitOperations(newVersion);
			// 设置npm源
			const oldRegistryUrl = await setNpmRegistry();
			// 检测是否已经登录npm
			await ensureNpmLoggedIn();
			// 发布到npm
			await publishToNpm();
			// 恢复npm源
			await restoreNpmRegistry(oldRegistryUrl);
		});
}

/**
 * 主函数入口
 */
async function main() {
	try {
		const latestVersion = await getLatestVersion();
		await displayOptions(latestVersion);
	} catch (error) {
		console.error('❌ 发生错误:', error);
	}
}

main();
