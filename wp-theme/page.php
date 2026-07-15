<?php

/**
 * The template for displaying all pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site may use a
 * different template.
 */

get_header();
?>

<main id="main-content" class="site-main">

  <?php
  while (have_posts()):
    the_post();
    the_title('<h1>', '</h1>');
    the_content();
  endwhile;
  ?>

</main>

<?php
get_footer();
