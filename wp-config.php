<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'skifidesigns' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         ']XvZNz)4.Z2cLFtJ}:W2EVqL.$FbNPuh,ai;trLTP~F#Bx/} an5Zr,Z|YV2DQ<k' );
define( 'SECURE_AUTH_KEY',  '5KFyIUhNd&W^dvJO!p7.EFfR&5;[:AqD$S6b}fa0@Yi=i{Zwu[3keZy_8&o]D[;^' );
define( 'LOGGED_IN_KEY',    ',!(:<h>H^}%.^o+8!PUm?78&sh/<kba<(hgkMK8Y4U>A2aZ8?bv;+[|h1*l[pcoH' );
define( 'NONCE_KEY',        '7c|N$>_MLv^BRIGahJ8E[agrA Is&{Ln|;/5[3n(6{l_mq`W}I~!z<^qI[H4CCYw' );
define( 'AUTH_SALT',        'RdP9:J|XP&l?kD]9XM7[t!{,t g/o[wH@8-cz7i5H*TJ}H.9 LaA8=,V#zKJGVI*' );
define( 'SECURE_AUTH_SALT', 'q! PD$z5*q?$F+v&:v)#CM)-DH>v i:<r[rcH7Tt.+1< /k$JZ^TYaaxhGp&<QjV' );
define( 'LOGGED_IN_SALT',   '5[Pta.5Aa4``$<~!:}ZvUV^or,}[kqnwq{dVu}*RKGuu7B[]bXwk^%[/%4VY`b]R' );
define( 'NONCE_SALT',       'SUqO8;qy`)q3 WyIvBu}:.FDRhHH#/wgL]#UK?c(e0[r7pJ@fK82wAtcJMkP#{om' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
