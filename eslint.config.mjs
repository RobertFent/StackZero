import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	pluginJs.configs.recommended,
	{
		ignores: ['node_modules', 'static']
	},
	{
		plugins: {
			prettier: eslintPluginPrettier
		},
		rules: {
			'array-callback-return': 'warn',
			'arrow-body-style': ['error', 'always'],
			curly: 'error',
			eqeqeq: ['error', 'always'],
			indent: 'off',
			'no-case-declarations': 'off',
			'no-console': 'warn',
			'no-unused-vars': 'off',
			'prefer-arrow-callback': 'error',
			'prettier/prettier': [
				'error',
				{
					useTabs: true,
					tabWidth: 4
				}
			]
		}
	},
	eslintConfigPrettier
];
