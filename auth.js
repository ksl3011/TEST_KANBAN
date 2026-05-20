const AuthKanban = (() => {
  // double-hash 버그 방지: hash 제외한 현재 URL을 redirectTo로 사용
  const redirectTo = location.origin + location.pathname;

  async function signInWithGoogle() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) alert('Google 로그인 실패: ' + error.message);
  }

  async function signInWithGitHub() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo },
    });
    if (error) alert('GitHub 로그인 실패: ' + error.message);
  }

  async function signOut() {
    await supabaseClient.auth.signOut();
    window.location.reload();
  }

  function onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }

  async function signInWithEmail(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) { alert('로그인 실패: ' + error.message); return false; }
    return true;
  }

  async function signUpWithEmail(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
      // 이미 가입된 이메일 (이메일 인증 완료된 계정)
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        alert('이미 가입된 이메일입니다. 로그인을 시도해 주세요.');
      } else {
        alert('회원가입 실패: ' + error.message);
      }
      return false;
    }
    // data.user 있고 session 없음 = 인증 메일 발송 (신규 or 미인증 재시도)
    if (data.user && !data.session) {
      alert('인증 이메일을 발송했습니다.\n메일함을 확인하고 링크를 클릭한 후 로그인해 주세요.');
    }
    return true;
  }

  return { signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail, signOut, onAuthStateChange };
})();
