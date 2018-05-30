import path from 'path';

/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - original webpack config.
 * @param {object} env - options passed to CLI.
 * @param {WebpackConfigHelpers} helpers - object with useful helpers when working with config.
 **/
export default function (config, env, helpers) {

	config.module.loaders[4].include = [
		path.resolve(__dirname, 'src', 'routes'),
		path.resolve(__dirname, 'src', 'components'),
		path.resolve(__dirname, 'src', 'lib')
	];
	
	config.module.loaders[5].exclude = [
		path.resolve(__dirname, 'src', 'routes'),
		path.resolve(__dirname, 'src', 'components'),
		path.resolve(__dirname, 'src', 'lib')
	  ];
}
