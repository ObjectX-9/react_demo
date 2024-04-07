import {readFileSync} from 'node:fs';

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';

const pkg = JSON.parse(readFileSync('./package.json'));

export default [
	// 第一步先打包出commonjs和esmodule的文件
	{
		input: './src/index.ts',
		output: [
			{
				file: pkg.main,
				format: 'cjs',
				sourcemap: true,
			},
			{
				file: pkg.module,
				format: 'esm',
				sourcemap: true,
			},
		],
		plugins: [
			resolve(),
			commonjs(),
			typescript({
				tsconfig: './tsconfig.json',
				declaration: true,
				declarationDir: 'types',
				outDir: 'dist',
			}),
			postcss(),
		],
	},
	// 第二步将esm打包出的文件再打包到index.d.ts中去
	{
		input: './dist/esm/types/index.d.ts',
		output: [{file: './dist/index.d.ts', format: 'esm'}],
		plugins: [dts()],
		external: [/\.(css|less|scss)$/],
	},
];
