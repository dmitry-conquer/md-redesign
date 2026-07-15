<?php

/**
 * WP Starter Theme functions and definitions
 *
 * This theme uses a class-based approach for code organization.
 * All functionality is organized into classes located in the /inc/ directory.
 * 
 * IMPORTANT: Avoid adding code directly to this file. Instead:
 * - Add new functionality to existing classes in /inc/
 * - Create new classes in /inc/ for new features
 * - Use the autoloader system for proper class loading
 */

if (!defined('ABSPATH')) {
  exit;
}

// Define theme constants
define('WP_STARTER_THEME_DIR', get_template_directory());
define('WP_STARTER_THEME_URI', get_template_directory_uri());

// Import theme classes
use \WP_Starter_Theme\Autoloader;
use \WP_Starter_Theme\Assets;
use \WP_Starter_Theme\Setup;
use \WP_Starter_Theme\Editor;
use \WP_Starter_Theme\Menu;
use \WP_Starter_Theme\Shortcodes;
use \WP_Starter_Theme\Utils;

// Load autoloader for class management
require_once WP_STARTER_THEME_DIR . '/inc/Autoloader.php';

// Initialize theme components
Autoloader::register();
Assets::register();
Setup::register();
Editor::register();
Menu::register();
Shortcodes::register();
Utils::register();
