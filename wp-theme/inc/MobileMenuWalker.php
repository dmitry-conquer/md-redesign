<?php

namespace WP_Starter_Theme;

if (!defined('ABSPATH')) {
  exit;
}

final class MobileMenuWalker extends \Walker_Nav_Menu {
  private const LI_TOP = 'border-b border-stone-100';
  private const ROW = 'flex items-center justify-between transition-colors hover:bg-stone-50';
  private const LINK = 'flex items-center px-5 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset';
  private const LINK_ACTIVE = 'relative flex items-center px-5 py-3 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset';
  private const LINK_PARENT = 'flex min-w-0 flex-1 items-center px-5 py-3 text-sm text-stone-600 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset';
  private const SUBMENU = 'w-full border-t border-stone-100 bg-stone-50';
  private const SUB_LINK = 'flex items-center gap-2.5 py-2.5 pr-5 pl-9 text-sm text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset';
  private const SUB_LINK_ACTIVE = 'flex items-center gap-2.5 bg-amber-50 py-2.5 pr-5 pl-9 text-sm font-medium text-stone-900 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset';
  private const BUTTON = 'flex h-11 w-11 shrink-0 items-center justify-center text-stone-400 transition-colors hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset';
  private const ACTIVE_BAR = 'absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r bg-amber-500';
  private const DOT = 'h-1 w-1 shrink-0 rounded-full bg-stone-300';
  private const DOT_ACTIVE = 'h-1 w-1 shrink-0 rounded-full bg-amber-500';

  private string $submenu_id = '';

  public function start_lvl(&$output, $depth = 0, $args = null): void {
    $id = $this->submenu_id ? ' id="' . esc_attr($this->submenu_id) . '"' : '';
    $output .= "\n<ul{$id} class=\"" . esc_attr(self::SUBMENU) . "\" x-show=\"isOpen\" x-collapse>\n";
  }

  public function end_lvl(&$output, $depth = 0, $args = null): void {
    $output .= "</ul>\n";
  }

  public function start_el(&$output, $item, $depth = 0, $args = null, $id = 0): void {
    $classes = empty($item->classes) ? [] : (array) $item->classes;
    $current = in_array('current-menu-item', $classes, true);
    $active = $current || in_array('current-menu-ancestor', $classes, true);
    $has_children = in_array('menu-item-has-children', $classes, true);
    $title = $this->title($item, $args, $depth);

    if ($has_children) {
      $this->submenu_id = 'mobile-submenu-' . (int) $item->ID;
      $output .= $this->open_li($depth, ' x-data="{ isOpen: ' . ($active ? 'true' : 'false') . ' }"');
      $output .= '<div class="' . esc_attr(self::ROW) . "\">\n";
      $output .= $this->link($item, $title, self::LINK_PARENT, $current);
      $output .= $this->toggle_button($title, $this->submenu_id);
      $output .= "</div>\n";
      return;
    }

    $output .= $this->open_li($depth);
    $output .= $this->link($item, $title, $this->link_class($depth, $active), $current, $depth > 0, $active);
  }

  public function end_el(&$output, $item, $depth = 0, $args = null): void {
    $output .= "</li>\n";
  }

  private function open_li(int $depth, string $extra = ''): string {
    $class = $depth === 0 ? ' class="' . esc_attr(self::LI_TOP) . '"' : '';
    return "<li{$class}{$extra}>\n";
  }

  private function link_class(int $depth, bool $active): string {
    if ($depth > 0) {
      return $active ? self::SUB_LINK_ACTIVE : self::SUB_LINK;
    }

    return $active ? self::LINK_ACTIVE : self::LINK;
  }

  private function link($item, string $title, string $class, bool $current, bool $with_dot = false, bool $active = false): string {
    $attrs = [
      'href' => !empty($item->url) ? esc_url($item->url) : '#',
      'class' => $class,
    ];

    if (!empty($item->target)) {
      $attrs['target'] = $item->target;
    }

    if (!empty($item->attr_title)) {
      $attrs['title'] = $item->attr_title;
    }

    if (!empty($item->xfn) || ($item->target ?? '') === '_blank') {
      $attrs['rel'] = trim(($item->xfn ?? '') . ' noopener');
    }

    if ($current) {
      $attrs['aria-current'] = 'page';
    }

    $prefix = $with_dot ? $this->dot($active || $current) : (($active || $current) && $class === self::LINK_ACTIVE ? $this->active_bar() : '');

    return '<a' . $this->attrs($attrs) . '>' . $prefix . esc_html($title) . "</a>\n";
  }

  private function title($item, $args, int $depth): string {
    $title = apply_filters('the_title', $item->title, $item->ID);
    return apply_filters('nav_menu_item_title', $title, $item, $args, $depth);
  }

  private function attrs(array $attrs): string {
    $html = '';

    foreach ($attrs as $name => $value) {
      if ($value !== '') {
        $html .= sprintf(' %s="%s"', esc_attr($name), esc_attr($value));
      }
    }

    return $html;
  }

  private function toggle_button(string $title, string $controls): string {
    return '<button type="button" class="' . esc_attr(self::BUTTON) . '" :aria-expanded="isOpen.toString()" aria-controls="' . esc_attr($controls) . '" aria-label="' . esc_attr(sprintf('Toggle %s submenu', $title)) . '" @click="isOpen = !isOpen">'
      . '<svg class="h-4 w-4 transition-transform duration-200" :style="isOpen ? \'transform: rotate(180deg)\' : \'\'" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">'
      . '<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>'
      . "</svg></button>\n";
  }

  private function active_bar(): string {
    return '<span class="' . esc_attr(self::ACTIVE_BAR) . '" aria-hidden="true"></span>';
  }

  private function dot(bool $active): string {
    return '<span class="' . esc_attr($active ? self::DOT_ACTIVE : self::DOT) . '" aria-hidden="true"></span>';
  }
}
