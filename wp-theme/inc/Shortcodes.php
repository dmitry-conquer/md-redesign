<?php
namespace WP_Starter_Theme;
if (!defined('ABSPATH')) {
  exit;
}

final class Shortcodes
{
  public static function register()
  {
    add_shortcode('current_year', [self::class, 'current_year_fn']);
  }
  public static function current_year_fn()
  {
    return esc_html(date('Y'));
  }
}