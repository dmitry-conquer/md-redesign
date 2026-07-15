<?php
namespace WP_Starter_Theme;

if (!defined('ABSPATH')) {
  exit;
}

final class Autoloader
{
  public static function register()
  {
    spl_autoload_register(function ($class) {
      $prefix = 'WP_Starter_Theme\\';
      if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
      }
      $base_path = WP_STARTER_THEME_DIR . '/inc/';
      $parsed_class = substr($class, strlen($prefix));
      $file = $base_path . str_replace('\\', '/', $parsed_class) . '.php';
      if (file_exists($file)) {
        require $file;
      }
    });
  }
}