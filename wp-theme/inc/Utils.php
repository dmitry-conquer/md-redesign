<?php

namespace WP_Starter_Theme;

if (!defined('ABSPATH')) {
  exit;
}

final class Utils {
  public static function register() {
  }

  public static function bg_style($image_id, $size = 'full') {
    $attachment_id = absint($image_id);
    if (!$attachment_id) {
      return '';
    }

    $url = wp_get_attachment_image_url($attachment_id, $size);
    if (!$url) {
      return '';
    }

    return sprintf('style="%s"', esc_attr(sprintf("background-image:url('%s')", esc_url($url))));
  }

  public static function asterisk_to_span($text) {
    if (empty($text) || !is_string($text)) {
      return $text;
    }
    return preg_replace('/\*([^*]+?)\*/', '<span>$1</span>', $text);
  }

  public static function render_button(array $link, string $type = 'link', string $class = '', string $event = 'open-contact-form'): void {
    if (empty($link['title'])) {
      return;
    }

    if ($type === 'dialog') {
      printf(
        '<button x-data type="button" aria-haspopup="dialog" @click="$dispatch(\'%s\')" class="%s">%s</button>',
        esc_attr($event),
        esc_attr($class),
        esc_html($link['title'])
      );
    } else {
      if (empty($link['url'])) {
        return;
      }

      printf(
        '<a href="%s" target="%s"%s class="%s">%s</a>',
        esc_url($link['url']),
        esc_attr($link['target'] ?: '_self'),
        $link['target'] === '_blank' ? ' rel="noopener"' : '',
        esc_attr($class),
        esc_html($link['title'])
      );
    }
  }
}
