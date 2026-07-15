<?php

namespace WP_Starter_Theme;

if (!defined('ABSPATH')) {
  exit;
}

final class Setup {
  public static function register() {
    add_action('after_setup_theme', [self::class, 'setup_theme']);
    add_action('wp_enqueue_scripts', [self::class, 'remove_block_css']);
    add_action('login_head', [self::class, 'custom_login_styles']);
    add_action('login_headerurl', [self::class, 'custom_login_logo_url']);
    add_action('login_headertext', [self::class, 'custom_login_logo_url_title']);
    add_filter('wp_img_tag_add_auto_sizes', '__return_false');
    self::disable_comments();
  }

  public static function remove_block_css() {
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('wc-block-style');
    wp_dequeue_style('storefront-gutenberg-blocks');
  }

  public static function setup_theme() {
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('custom-logo', [
      'height' => 100,
      'width' => 400,
      'flex-height' => true,
      'flex-width' => true,
    ]);
  }

  public static function custom_login_styles() {
    echo '<style>
			body.login {
					background: linear-gradient(357deg, rgb(70 182 191 / 67%) 0%, rgb(255 255 255 / 82%) 100%);
			}
			.login h1 a {
					background-image: url("");
					background-size: contain;
					width: 100%;
					height: 80px;
			}
			.login form {
					border-radius: 10px;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
			}
	</style>';
  }

  public static function custom_login_logo_url() {
    return home_url();
  }

  public static function custom_login_logo_url_title() {
    return get_bloginfo('name');
  }

  public static function disable_comments() {
    add_action('admin_init', function () {
      // Redirect any user trying to access comments page
      global $pagenow;

      if ($pagenow === 'edit-comments.php') {
        wp_safe_redirect(admin_url());
        exit;
      }

      // Remove comments metabox from dashboard
      remove_meta_box('dashboard_recent_comments', 'dashboard', 'normal');

      // Disable support for comments and trackbacks in post types
      foreach (get_post_types() as $post_type) {
        if (post_type_supports($post_type, 'comments')) {
          remove_post_type_support($post_type, 'comments');
          remove_post_type_support($post_type, 'trackbacks');
        }
      }
    });

    // Close comments on the front-end
    add_filter('comments_open', '__return_false', 20, 2);
    add_filter('pings_open', '__return_false', 20, 2);

    // Hide existing comments
    add_filter('comments_array', '__return_empty_array', 10, 2);

    // Remove comments page in menu
    add_action('admin_menu', function () {
      remove_menu_page('edit-comments.php');
    });

    // Remove comments links from admin bar
    add_action('init', function () {
      if (is_admin_bar_showing()) {
        remove_action('admin_bar_menu', 'wp_admin_bar_comments_menu', 60);
      }
    });
  }
}
