$(function(){
var num=$('.thumbnails').children().length,
margen='.5',
totel=(num-1)*margen,
width=(100-totel)/num
console.log(width);
console.log(totel);
 $('.thumbnails img').css({
    'width':width + '%',
    'margin-right':margen + '%',
 })
$('.thumbnails img').on('click', function () {
$(this).addClass('selct').siblings().removeClass('selct')
$('.masterImg img').hide().attr('src',$(this).attr('src')).fadeIn(1000)
});
/////.masterImg .fa-chevron
$('.masterImg .fa-chevron-right').on('click', function () {

if ($('.thumbnails .selct').is(':last-child')) {
$('.thumbnails img').eq(0).click()
}else{
$('.thumbnails .selct').next().click()
}

});
$('.masterImg .fa-chevron-left').on('click', function () {
if ($('.thumbnails .selct').is(':first-child')) {
$('.thumbnails img:last').click()
}else{
$('.thumbnails .selct').prev().click()
}

});
})