// ==UserScript==
// @name        DTF Tagging User
// @match       https://dtf.ru/*
// @version     1.2 (2021-09-26)
// @license     MIT
// @author      KekW - https://dtf.ru/u/182912-kekw / πρόσταγμα - https://dtf.ru/u/74342-prostagma
// @description Задавайте свои метки для пользователей.
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addValueChangeListener
// @run-at      document-end
// @icon        https://raw.githubusercontent.com/KekWCatra/DtfTaggingUser/main/tag.png
// @icon64      https://raw.githubusercontent.com/KekWCatra/DtfTaggingUser/main/tag.png
// @updateURL   https://github.com/KekWCatra/DtfTaggingUser/raw/main/DTFTaggingUser.user.js
// @downloadURL https://github.com/KekWCatra/DtfTaggingUser/raw/main/DTFTaggingUser.user.js
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
                            <span class="ui-checkbox">
                            	<input type="checkbox" class="checkbox__input" name="_kekw_tag_as_name" id="_kekw_tag_as_name" autocomplete="off" data-gtm="User — Settings — Use Tag As UserName" data-processed="true">
                            </span>
                            <label for="_kekw_tag_as_name">Использовать как основной никнейм</label>
                        </fieldset>
						<fieldset>
							<input type="submit" id="_kekw_dtf_tag_set_user" value="Сохранить">
                            <input type="button" class="ui-button ui-button--2" id="_kekw_dtf_tag_clear_user" value="Очистить">
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
let kekwPopupTagCorrectBg = '';

if (body.classList.contains('s42-light') || body.classList.contains('s42-no-themes') || !body.classList.contains('s42-dtf-dark') && !document.getElementById('stylus-1')) {
    kekwPopupTagCorrectBg = `
#_kekw_popup_main_tagging > div.popup__container.popup__container--shown > div > div.popup__container__window__tpl {
    background: #ffffff!important;
}`;
}

head.appendChild(DocStyle);
DocStyle.type = 'text/css';
if (DocStyle.styleSheet){
    DocStyle.styleSheet.cssText = kekwPopupTagCorrectBg;
} else {
    DocStyle.appendChild(document.createTextNode(kekwPopupTagCorrectBg));
}

function checkColor(color)
{
    color = color.substring(1);
    let rgb = parseInt(color, 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = (rgb >> 0) & 0xff;

    let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return luma < 40;
}

function saveTags()
{
    GM_setValue('_dtf_user_tags', JSON.stringify(_kekw_dtfTagUser, (k, v) => v ? v : void 0));
}

function printRatingTag()
{
    Object.keys(_kekw_dtfTagUser).forEach(function(id) {
        document.querySelectorAll('a[href*="/' + id + '-"][class*="popover-item"] > .popover-item__main:not(._kekw_has_tag)').forEach(function(userNameHtml) {
            userNameHtml.classList.add('_kekw_has_tag');

            let spanTag = document.createElement('span');
            let [tag, tag_bg, tag_text, tag_as_name] = _kekw_dtfTagUser[id].split('|$|');
            spanTag.innerText = tag;
            spanTag.style.cssText = "background: " + tag_bg + "!important; color:" + tag_text + "!important;height: 20px!important;line-height: 20px!important;padding: 1px 5px!important;margin-left: 5px;";
            spanTag.className = "ui-button ui-button--2 ui-button--small";

            tag_as_name == 1 ? userNameHtml.replaceWith(spanTag) : userNameHtml.getElementsByClassName('popover-item__label')[0].append(spanTag);;
        });
    });
}

function printTag()
{
    Object.keys(_kekw_dtfTagUser).forEach(function(id) {
        document.querySelectorAll('a[href*="/' + id + '-"][class*="comment-user"] > .comment-user__name:not(._kekw_has_tag), .content-header__info > a[href*="/' + id + '-"][class*="content-header-author"]:not(._kekw_has_tag), .subsite-card-title > a[href*="/' + id + '-"][class*="subsite-card-title__item--name"]:not(._kekw_has_tag), a[href*="/' + id + '-"][class*="v-list__item"] > div[class*="v-list__label"]:not(._kekw_has_tag)').forEach(function(userNameHtml) {
            let spanTag = document.createElement('span');
            let [tag, tag_bg, tag_text, tag_as_name] = _kekw_dtfTagUser[id].split('|$|');

            if (userNameHtml.classList.contains('_kekw_has_tag')) {
                return;
            }

            spanTag.innerText = tag;
            spanTag.style.cssText = "background: " + tag_bg + "!important; color:" + tag_text + "!important;height: 20px!important;line-height: 20px!important;padding: 1px 5px!important;margin-left: 5px;";
            spanTag.className = "ui-button ui-button--2 ui-button--small";

            if (tag_as_name == 1) {
                let className = userNameHtml.classList.item(userNameHtml.classList.length - 1);
                switch(className) {
                    case 'comment-user__name':
                        console.log(userNameHtml);
                        spanTag.style.marginLeft = '0px';
                        userNameHtml.classList.add('_kekw_has_tag');
                        userNameHtml.replaceWith(spanTag);
                        break;
                    case 'subsite-card-title__item--name':
                        spanTag.style.marginLeft = '0px';
                        spanTag.style.marginRight = 'var(--items-gap)';
                        userNameHtml.classList.add('_kekw_has_tag');
                        userNameHtml.parentElement.replaceChild(spanTag, userNameHtml.parentElement.firstElementChild);
                        break;
                    case 'content-header__item':
                        spanTag.style.marginLeft = userNameHtml.classList.item(userNameHtml.classList.length - 2) == 'content-header-author--subsite' ? '32px' : '0px';
                        userNameHtml.classList.add('_kekw_has_tag');
                        userNameHtml.getElementsByClassName('content-header-author__name')[0].replaceWith(spanTag);
                        break;
                    case 'v-list__label':
                        spanTag.style.marginLeft = '0px';
                        spanTag.style.setProperty('font-size', "16px");
                        spanTag.style.padding = '3px 6px';
                        userNameHtml.classList.add('_kekw_has_tag');
                        userNameHtml.replaceWith(spanTag);
                        break;
                    default:
                        break;
                }
            } else {
                userNameHtml.classList.add('_kekw_has_tag');
                userNameHtml.parentElement.append(spanTag);
            }

        });
    });
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

    let asUserName = document.getElementById('_kekw_tag_as_name').parentElement.classList.contains('ui-checkbox--checked') ? 1 : 0;

    Object.assign(_kekw_dtfTagUser, { [userId]: [tag, colorBg, colorText, asUserName].join('|$|') });

    saveTags();

    document.getElementById('_kekw_popup_main_tagging').remove();
}

function clearTag()
{
    delete _kekw_dtfTagUser[userId];
    saveTags();

    document.getElementById('_kekw_dtf_tag').value = '';
    document.getElementById('_kekw_color_dtf_tag_bg').value = '#000000';
    document.getElementById('_kekw_color_dtf_tag_text').value = '#ffffff';
    document.getElementById('_kekw_tag_as_name').checked = false;
    document.getElementById('_kekw_tag_as_name').parentElement.classList.remove('ui-checkbox--checked');
}

function popupSetTag()
{
    body.insertAdjacentHTML('beforeend', popupTagging);
    userName = document.querySelector('div.v-header-title__main > a.v-header-title__name').innerText.toString();
    document.getElementById('userNameDtfTagging').innerText = userName;
    let dataTag = _kekw_dtfTagUser[userId];
    if (dataTag) {
        let [tag, tag_bg, tag_text, tag_as_name] = dataTag.split('|$|');
        document.getElementById('_kekw_dtf_tag').value = tag;
        document.getElementById('_kekw_color_dtf_tag_bg').value = tag_bg;
        document.getElementById('_kekw_color_dtf_tag_text').value = tag_text;
        if (tag_as_name == 1) {
            let chekbox = document.getElementById('_kekw_tag_as_name');
            chekbox.checked = true;
            chekbox.parentElement.classList.add('ui-checkbox--checked')
        }
    }

    let closePopup = document.getElementById('_kekw_close_dtf_popup_tagging');
    closePopup.addEventListener('click', function (event) {
        document.getElementById('_kekw_popup_main_tagging').remove();
    });

    let setTagButton = document.getElementById('_kekw_dtf_tag_set_user');
    setTagButton.addEventListener('click', setTag);

    let clearTagButtom = document.getElementById('_kekw_dtf_tag_clear_user');
    clearTagButtom.addEventListener('click', clearTag);
}

function addTaggingButton()
{
    let target = document.querySelector('.v-header--with-actions > .v-header__actions');
    let loc = window.location;

    if (target && loc.toString().indexOf('/u/') >= 0 && !document.querySelector('._dtf_tagging_user') && !document.querySelector('a[href*="/settings"][class*="v-button"]')) {
        userId = target.querySelector('[data-subsite-id]').dataset.subsiteId;

        let divButton = document.createElement('div');

        divButton.onclick = popupSetTag;

        divButton.className = '_dtf_tagging_user v-button v-button--default v-button--size-default';
        divButton.innerHTML = `<span class="v-button__label">✎ Тегнуть</span>`;

        target.insertAdjacentElement('afterbegin', divButton);
    }
}

function init(run)
{
    try {
        _kekw_dtfTagUser = JSON.parse(GM_getValue('_dtf_user_tags', '{}') || '{}');
    } catch (e) {
        _kekw_dtfTagUser = {};
    }
}

init(false);
GM_addValueChangeListener('_dtf_user_tags', function(changes, namespace) {
    init(true);
});

addEventListener('DOMContentLoaded', function() {
    addTaggingButton();
    printTag();
});

addEventListener('DOMNodeInserted', function() {
    addTaggingButton();
    printTag();
    printRatingTag();
});
