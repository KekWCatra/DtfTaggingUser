// ==UserScript==
// @name        DTF Tagging User
// @match       https://dtf.ru/*
// @version     0.1
// @license     MIT
// @author      KekW / https://dtf.ru/u/182912-kekw
// @description 27/3/2021
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addValueChangeListener
// @run-at      document-end
// ==/UserScript==

let _kekw_dtfTagUser = {};
let userName = '';
let userId = -1;

let popupTagging = `
<div class="popup" id="_kekw_popup_main_tagging">
	<div class="popup__layout popup__layout--shown"></div>
	<div class="popup__container popup__container--shown">
		<div class="popup__container__window popup__container__window--styled" style="width:500px!important;">
			<div class="popup__container__window__close" id="_kekw_close_dtf_popup_tagging">
				<svg class="icon icon--ui_close" width="12" height="12">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ui_close"></use>
				</svg>
			</div>
			<div class="popup__container__window__tpl">
				<div class="popup__content popup__content--misprint">
					<h4>Тег для <span id="userNameDtfTagging"></span></h4>
					<div class="ui_form">
                        <fieldset>
                            <p class="selected_text">
						        <span>Цвет тега</span>
					        </p>
							<input type="color" name="_kekw_color_dtf_tag_bg" id="_kekw_color_dtf_tag_bg" style="width: 100%;">
						</fieldset>
                        <fieldset>
                            <p class="selected_text">
						        <span>Цвет текста</span>
					        </p>
							<input type="color" name="_kekw_color_dtf_tag_text" id="_kekw_color_dtf_tag_text" style="width: 100%;">
						</fieldset>
						<fieldset>
							<textarea name="_kekw_dtf_tag" id="_kekw_dtf_tag" tabindex="1" placeholder="Тег (ананасик/шитпостер/анимешник/etc)"></textarea>
						</fieldset>
						<fieldset>
							<input type="submit" id="_kekw_dtf_tag_set_user" value="Отправить">
						</fieldset>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
`;

let head = document.head || document.getElementsByTagName('head')[0];
let body = document.body || document.getElementsByTagName('body')[0];

let DocStyle = document.createElement('style');

function checkColor(color)
{
    color = color.substring(1);
    let rgb = parseInt(color, 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >>  8) & 0xff;
    let b = (rgb >>  0) & 0xff;

    let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return luma < 40;
}

function saveTags()
{
    GM_setValue('_dtf_user_tags', JSON.stringify(_kekw_dtfTagUser, (k, v) => v ? v : void 0));
}

function printTag()
{
    Object.keys(_kekw_dtfTagUser).forEach(function(id) {
        document.querySelectorAll('a[href*="/' + id + '-"][class*="comments__item__user"] > .comments__item__user__name').forEach(function(userNameHtml) {
            if (userNameHtml.getElementsByClassName('_kekw_has_tag').length == 0) {
                let spanTag = document.createElement('span');
                spanTag.innerText = _kekw_dtfTagUser[id].split('|$|')[0];
                spanTag.style.cssText = "background: " + _kekw_dtfTagUser[id].split('|$|')[1] + "!important; color:" + _kekw_dtfTagUser[id].split('|$|')[2] + "!important;height: 20px!important;line-height: 20px!important;padding: 1px 5px!important;";
                spanTag.className = "ui-button ui-button--2 ui-button--small _kekw_has_tag";
                userNameHtml.append(spanTag);
            }
        });
    });
    setTimeout(printTag, 500);
}

function setTag()
{
    let tag = document.getElementById('_kekw_dtf_tag').value.toString().trim();

    if (!tag.length) {
        return;
    }

    if (userId <= 0) {
        return;
    }

    let colorBg = document.getElementById('_kekw_color_dtf_tag_bg').value.toString().trim();
    let colorText = document.getElementById('_kekw_color_dtf_tag_text').value.toString().trim();

    if (colorBg == colorText) {
        colorText = checkColor(colorText) ? '#ffffff' : '#000000';
    } else if(checkColor(colorText) && checkColor(colorBg)) {
        colorText = '#ffffff';
    }

    Object.assign(_kekw_dtfTagUser, { [userId]: tag + '|$|' + colorBg + '|$|' + colorText });

    saveTags();

    document.getElementById('_kekw_popup_main_tagging').remove();
}

function getValue()
{
    return _kekw_dtfTagUser[userId];
}

function popupSetTag()
{
    body.insertAdjacentHTML('beforeend', popupTagging);
    document.getElementById('userNameDtfTagging').innerText = userName;

    let dataTag = getValue();
    if (dataTag) {
        document.getElementById('_kekw_dtf_tag').value = dataTag.split('|$|')[0];
        document.getElementById('_kekw_color_dtf_tag_bg').value = dataTag.split('|$|')[1];
        document.getElementById('_kekw_color_dtf_tag_text').value = dataTag.split('|$|')[2];
    }

    let closePopup = document.getElementById('_kekw_close_dtf_popup_tagging');
    closePopup.addEventListener('click', function (event) {
        document.getElementById('_kekw_popup_main_tagging').remove();
    });

    let setTagButton = document.getElementById('_kekw_dtf_tag_set_user');
    setTagButton.addEventListener('click', setTag);
}

function addTaggingButton()
{
    let target = document.querySelector('.etc_control[data-subsite-url]');
    let loc = window.location;

    if (target && loc.toString().indexOf('/u/') >= 0 && !document.querySelector('._dtf_tagging_user')) {
        userName = document.querySelector('div.v-header-title__main > a.v-header-title__name').innerText.toString();
        userId = target.dataset.userId;

        let divButton = document.createElement('div');

        divButton.onclick = function() {
            popupSetTag();
        };
        divButton.className = '_dtf_tagging_user v-button v-button--blue v-button--size-default';
        divButton.innerHTML = `<span class="v-button__label">✎ Тегнуть</span>`;

        target.insertAdjacentElement('beforebegin', divButton);
    }

    setTimeout(addTaggingButton, 500);
}

function init(run)
{
    try {
        _kekw_dtfTagUser = JSON.parse(GM_getValue('_dtf_user_tags', '{}') || '{}');
    } catch (e) {
        _kekw_dtfTagUser = {};
    }

    if (!run) {
        addTaggingButton();
    }

    printTag();
}

init(false);
GM_addValueChangeListener('_dtf_user_tags', function(changes, namespace) {
    init(true);
});