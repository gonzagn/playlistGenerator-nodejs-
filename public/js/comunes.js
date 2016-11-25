/**
 * Created by gonzalogarcia on 25/11/16.
 */
function fire_pop_up(popup_txt){
    if(typeof popup_txt == 'undefined') {
        popup_txt = 'UPS! SUCEDIÓ UN ERROR. POR FAVOR, INTÉNTALO DE NUEVO';
    }
    $.magnificPopup.open({
        items: {
            src: "<div class='magnific_popup'>" + popup_txt + "</div>"
        },
        type: 'inline',
        callbacks: {
            beforeOpen: function() {
                this.st.mainClass = 'bounceIn';
            },
            open: function() {

            }
        }
    });
}
