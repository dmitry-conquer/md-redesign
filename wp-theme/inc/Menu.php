<?php

namespace WP_Starter_Theme;

if (!defined('ABSPATH')) {
  exit;
}

final class Menu {
  public static function register() {
    add_action('after_setup_theme', [self::class, 'register_menus']);
    add_filter('nav_menu_link_attributes', [self::class, 'add_custom_classes_to_menu_link'], 10, 4);
    add_filter('nav_menu_item_attributes', [self::class, 'add_custom_attributes_to_menu_item'], 10, 4);
    add_filter('nav_menu_css_class', [self::class, 'add_custom_classes_to_menu_li'], 10, 4);
    add_filter('nav_menu_submenu_css_class', [self::class, 'add_custom_classes_to_menu_submenu'], 10, 3);
    add_filter('nav_menu_submenu_attributes', [self::class, 'add_custom_attributes_to_menu_submenu'], 10, 3);
  }

  public static function register_menus() {
    register_nav_menus([
      'header_menu' => 'Header menu',
      'header_mobile_menu' => 'Header mobile menu',
      'footer_menu' => 'Footer mobile menu',
      'footer_locations_menu' => 'Footer locations menu',
      'footer_quick_links_menu' => 'Footer quick links menu',
    ]);
  }

  public static function add_custom_classes_to_menu_link($atts, $item, $args, $depth) {
    $is_active = in_array('current-menu-item', $item->classes) || in_array('current-menu-ancestor', $item->classes);
    $active_class = $is_active ? ' text-primary-500' : '';

    if ($args->theme_location === 'header_menu') {
      $atts['class'] = ($atts['class'] ?? '') . ' flex items-center gap-x-2 p-2 font-bold text-blue-950 transition-colors hover:text-blue-700 2xl:text-lg' . $active_class;
    }
    if ($args->theme_location === 'header_menu' && $depth === 0 && in_array('menu-item-has-children', $item->classes)) {
      $atts['class'] = ($atts['class'] ?? '') . "  flex items-center gap-x-2 p-2 font-bold text-blue-950 transition-colors after:size-2.5 after:shrink-0 after:bg-(image:--menu-arrow) after:bg-contain after:bg-center after:bg-no-repeat after:transition-all after:duration-300 after:content-[''] group-hover/hassub:after:-rotate-180 hover:text-blue-700 2xl:text-lg" . $active_class;
    }
    
    if ($args->theme_location === 'header_menu' && $depth === 1) {
      $atts['class'] = "block px-4 py-2 text-lg text-blue-950 transition-colors hover:bg-neutral-500/5 hover:text-blue-950 min-w-max";
    }
    if ($args->theme_location === 'header_mobile_menu' && $depth === 0) {
      $atts['class'] = "flex items-center gap-x-2 text-3xl font-bold text-white before:size-2 before:shrink-0 before:rounded-full before:bg-red-600 before:content-[''] sm:text-4xl";
    }
    if ($args->theme_location === 'header_mobile_menu' && $depth === 1) {
      $atts['class'] = "flex items-center gap-x-4 p-2 text-2xl text-white before:size-1.5 before:shrink-0 before:rounded-full before:bg-white before:content-['']";
    }
    if (
      $args->theme_location === 'footer_menu'
      || $args->theme_location === 'footer_locations_menu'
      || $args->theme_location === 'footer_quick_links_menu'
    ) {
      $atts['class'] = 'block py-1 text-sm text-zinc-400 transition-colors duration-300 hover:text-slate-500';
    }
    return $atts;
  }

  public static function add_custom_attributes_to_menu_item($atts, $item, $args, $depth) {
    if ($args->theme_location === 'header_mobile_menu' && $depth === 0 && in_array('menu-item-has-children', $item->classes)) {
      $atts['x-data'] = "{isItemOpen:false}";
      $atts['@click'] = "isItemOpen = !isItemOpen";
      $atts[':class'] = "{'after:rotate-90': isItemOpen, 'translate-x-0 opacity-100': isMenuOpen, 'translate-x-10 opacity-0': !isMenuOpen}";
    }
    if ($args->theme_location === 'header_mobile_menu' && $depth === 0 && !in_array('menu-item-has-children', $item->classes)) {
      $atts[':class'] = "{'translate-x-0 opacity-100': isMenuOpen,'translate-x-10 opacity-0': !isMenuOpen}";
    }
    if (
      $args->theme_location === 'footer_menu'
      || $args->theme_location === 'footer_locations_menu'
      || $args->theme_location === 'footer_quick_links_menu'
    ) {
      $atts['class'] = 'leading-none';
    }
    return $atts;
  }

  public static function add_custom_classes_to_menu_li($classes, $item, $args, $depth) {
    if ($args->theme_location === 'header_menu' && $depth === 0 && in_array('menu-item-has-children', $item->classes)) {
      $classes[] = "group/hassub relative";
    }
    if ($args->theme_location === 'header_mobile_menu' && $depth === 0) {
      $classes[] = "translate-x-10 py-4 opacity-0 transition-all duration-500";
    }
    if ($args->theme_location === 'header_mobile_menu' && $depth === 0 && in_array('menu-item-has-children', $item->classes)) {
      $classes[] = "flex translate-x-10 flex-wrap items-center justify-between gap-x-3 py-4 opacity-0 transition-all duration-500 after:size-6 after:shrink-0 after:bg-(image:--mobile-menu-arrow) after:bg-contain after:bg-center after:bg-no-repeat after:transition-all after:duration-500 after:content-['']";
    }
    return $classes;
  }

  public static function add_custom_classes_to_menu_submenu($classes, $args, $depth) {
    if ($args->theme_location === 'header_mobile_menu') {
      $classes[] = 'order-last mt-2 w-full rounded-md border-l border-blue-900 bg-white/5 px-4';
    }
    if ($args->theme_location === 'header_menu') {
      $classes[] = 'pointer-events-none invisible absolute top-full left-0 z-80 min-w-60 -translate-y-2 rounded-b-lg bg-white opacity-0 transition-all duration-300 group-hover/hassub:pointer-events-auto group-hover/hassub:visible group-hover/hassub:translate-y-0 group-hover/hassub:opacity-100';
    }
    return $classes;
  }

  public static function add_custom_attributes_to_menu_submenu($atts, $args, $depth) {
    if ($args->theme_location === 'header_mobile_menu') {
      $atts['x-show'] = 'isItemOpen';
      $atts['x-cloak'] = true;
      $atts['x-collapse.duration.500ms'] = true;
    }
    return $atts;
  }
}
