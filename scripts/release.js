const {exec, execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const projectRootPath = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRootPath, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageName = packageJson.name;
console.log('✅ 部署脚本启动:', packageName);

function isPreRelease(version) {
	return /-/.test(version);
}

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
			throw new Error(`Unsupported pre-release type: ${type}`);
	}
}

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

function updateVersion(newVersion) {
	packageJson.version = newVersion;
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
	console.log(`✅ 版本号已更新为 ${newVersion}`);
}

function publishToNpm(newVersion) {
	console.log('🚀 正在发布到 npm...');
	exec('npm publish', (error, stdout, stderr) => {
		if (error) {
			console.error(`❌ 发布失败: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`❌ 错误: ${stderr}`);
			return;
		}
		console.log(`🎉 发布成功: ${stdout}`);
	});
}

function gitOperations(newVersion) {
	try {
		process.chdir(projectRootPath); // Change the current working directory to project root

		execSync(`git add .`, {stdio: 'inherit'});
		execSync(`git commit -m "chore(release): ${newVersion}"`, {
			stdio: 'inherit',
		});
		execSync(`git tag v${newVersion}`, {stdio: 'inherit'});
		execSync(`git push`, {stdio: 'inherit'});
		execSync(`git push origin v${newVersion}`, {stdio: 'inherit'});

		console.log(`✔️ Git tag v${newVersion} has been pushed.`);
	} catch (error) {
		console.error(`❌ Git operation failed: ${error.message}`);
	}
}

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

function setNpmRegistry() {
	const NPM_REGISTRY_URL = 'https://registry.npmjs.org/';
	exec(
		`npm config set registry ${NPM_REGISTRY_URL}`,
		(error, stdout, stderr) => {
			if (error) {
				console.error(`设置npm registry出错: ${error.message}`);
				return;
			}
			if (stderr) {
				console.error(`❌ 设置npm registry出错: ${stderr}`);
				return;
			}
			console.log(`npm registry已设置为: ${NPM_REGISTRY_URL}`);
		},
	);
}

getLatestVersion((latestVersion) => {
	setNpmRegistry();
	displayOptions(latestVersion);
});
