/**
 * << ipsSettings['csrfKey'] >>
 *
 * Find user by name.
 */
const SearchUser = (function () {
  /**
   * Ability to 'abort' current search.
   */
  function find(username) {
    return interruptAndSend({
      url: `https://osbot.org/forum/index.php?app=core&module=system&controller=editor&do=mention&input=${username}&csrfKey=${ipsSettings["csrfKey"]}`,
      type: "GET",
    })
      .then(toHTML)
      .then(getListItems)
      .then(extractAllUserInformation)
      .then(excluseSelf);
  }

  function getListItems(html) {
    return html.querySelectorAll("li");
  }

  function extractAllUserInformation(listItems) {
    return Array.from(listItems).map(extractUserInformation);
  }

  function extractUserInformation(listItem) {
    return {
      userName: listItem.querySelector("a span").innerText,
      userId: parseInt(listItem.dataset.mentionid),
      userProfileUrl: listItem.dataset.mentionhref,
      userAvatarUrl: listItem.querySelector("a img").src,
    };
  }

  function excluseSelf(users) {
    return users.filter((user) => user.userId !== ipsSettings.memberID);
  }

  return {
    find: find,
  };
})();
