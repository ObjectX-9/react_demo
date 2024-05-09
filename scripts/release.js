const {exec, execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const projectRootPath = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRootPath, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageName = packageJson.name;
let oldNpmRegistry = null;
console.log('✅ 发包脚本启动【自动更新版本号、自动发布到npm】');
console.log('!!! 使用前请确保仓库内已经是可发布状态');

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
			throw new Error(`不支持的预发布版本类型: ${type}`);
	}
}

/**
 * 获取最新版本号
 * @param {*} callback
 */
function getLatestVersion(callback) {
	exec(`npm show ${packageName} version`, (error, stdout) => {
		if (error) {
			console.error(`获取最新版本失败: ${error.message}`);
			return;
		}
		const latestVersion = stdout.trim().replace(/^v/, ''); // 删除可能存在的前导 v
		callback(latestVersion);
	});
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
 */
function ensureNpmLoggedIn(callback) {
    exec('npm whoami', (err, stdout, stderr) => {
        if (err) {
            console.error('❌ 您似乎还没有登录到npm。请登录后继续。');
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'username',
                    message: '请输入您的npm用户名:'
                },
                {
                    type: 'password',
                    name: 'password',
                    message: '请输入您的npm密码:'
                },
                {
                    type: 'input',
                    name: 'email',
                    message: '请输入您的npm邮箱地址:'
                }
            ]).then(answers => {
                exec(`npm login`, (err, stdout, stderr) => {
                    // 输入用户名、密码、邮箱等输入可能需要使用特殊方式处理，例如使用子进程的stdin写入，这取决于npm如何从CLI处理输入。
                }).stdin.write(`${answers.username}\n${answers.password}\n${answers.email}\n`);
            });
        } else {
            console.log(`✅ 检测到您已作为${stdout.trim()}登录到npm`);
            callback();
        }
    });
}

/**
 * 发布到npm
 * @param {*} newVersion
 */
function publishToNpm(newVersion) {
    ensureNpmLoggedIn(() => {
			console.log('🚀 正在发布到 npm...');
			exec('npm publish', (error, stdout, stderr) => {
				if (error) {
					console.error(`❌ 发布失败: ${error.message}`);
					return;
				}
				if (stderr) {
					console.error(`✅ 发布输出流: ${stderr}`);
					return;
				}
				console.log(`🎉 发布成功: ${stdout}`);
				// 发布完成后，恢复原来的registry
				restoreNpmRegistry();
			});
		});
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
						`远程分支 'origin/${branchName}' 不存在，无法设置 upstream。`,
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
 * 命令行显示逻辑
 * @param {*} latestVersion
 */
function displayOptions(latestVersion) {
	const currentVersion = parseVersion(latestVersion);
	const choices = [
		{name: `Major (${parseInt(currentVersion.major) + 1}.0.0)`, value: 'major'},
		{
			name: `Minor (${currentVersion.major}.${parseInt(currentVersion.minor) + 1}.0)`,
			value: 'minor',
		},
		{
			name: `Patch (${currentVersion.major}.${currentVersion.minor}.${parseInt(currentVersion.patch) + 1})`,
			value: 'patch',
		},
		{name: `Prepatch`, value: 'prepatch'},
		{name: `Preminor`, value: 'preminor'},
		{name: `Premajor`, value: 'premajor'},
		{name: `Prerelease`, value: 'prerelease'},
		{name: `Specific version`, value: 'specific'},
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
		.then((answers) => {
			let newVersion = '';
			if (answers.releaseType === 'specific') {
				newVersion = answers.specificVersion;
			} else if (['major', 'minor', 'patch'].includes(answers.releaseType)) {
				currentVersion[answers.releaseType]++;
				newVersion = `${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`;
			} else {
				newVersion = getPreReleaseVersion(currentVersion, answers.releaseType);
			}
			// 更新版本号
			updateVersion(newVersion);
			// 增加tag并提交
			gitOperations(newVersion);
			// 发布到npm
			publishToNpm(newVersion);
		});
}

/**
 * 设置npm的registry
 */
function setNpmRegistry() {
	exec(`npm config get registry`, (error, stdout, stderr) => {
		if (error) {
			console.error(`获取npm当前registry出错: ${error.message}`);
			return;
		}

		// 保存当前的registry地址
		oldNpmRegistry = stdout.trim();

		const NPM_REGISTRY_URL = 'https://registry.npmjs.org/';
		exec(
			`npm config set registry ${NPM_REGISTRY_URL}`,
			(err, stdout, stderr) => {
				if (err) {
					console.error(`设置npm registry出错: ${err.message}`);
					return;
				}
				if (stderr) {
					console.error(`✅ 设置npm registry输出流: ${stderr}`);
					return;
				}
				console.log(`npm registry已设置为: ${NPM_REGISTRY_URL}`);
				// 继续后续操作
				getLatestVersion((latestVersion) => {
					displayOptions(latestVersion);
				});
			},
		);
	});
}

/**
 * 恢复到旧的npm registry
 */
function restoreNpmRegistry() {
	if (oldNpmRegistry) {
		exec(
			`npm config set registry ${oldNpmRegistry}`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`恢复npm registry出错: ${error.message}`);
					return;
				}
				if (stderr) {
					console.error(`✅ 恢复npm registry输出流: ${stderr}`);
					return;
				}
				console.log(`npm registry已恢复为: ${oldNpmRegistry}`);
			},
		);
	}
}


getLatestVersion((latestVersion) => {
	setNpmRegistry();
	displayOptions(latestVersion);
});
