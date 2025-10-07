<script>
  import { Modal, Button, Input, Label, Select, Textarea, Checkbox } from 'flowbite-svelte';
  import { createEventDispatcher } from 'svelte';

  // Props
  export let open = false;
  export let title = '폼 모달';
  export let size = 'md'; // xs, sm, md, lg, xl
  export let fields = []; // 필드 정의 배열
  export let formData = {}; // 폼 데이터
  export let submitText = '저장';
  export let cancelText = '취소';
  export let loading = false;
  export let validationErrors = {};

  const dispatch = createEventDispatcher();

  // 폼 데이터 로컬 복사본
  let localFormData = { ...formData };

  // 폼 데이터가 변경될 때 로컬 복사본 업데이트
  $: if (open) {
    localFormData = { ...formData };
  }

  function handleSubmit() {
    dispatch('submit', localFormData);
  }

  function handleCancel() {
    localFormData = { ...formData }; // 원래 데이터로 복원
    dispatch('cancel');
  }

  function handleClose() {
    localFormData = { ...formData }; // 원래 데이터로 복원
    dispatch('close');
  }

  // 필드 타입별 컴포넌트 렌더링
  function getFieldValue(field) {
    return localFormData[field.name] || field.defaultValue || '';
  }

  function setFieldValue(field, value) {
    localFormData = { ...localFormData, [field.name]: value };
  }

  function getFieldError(fieldName) {
    return validationErrors[fieldName] || '';
  }

  function hasFieldError(fieldName) {
    return !!validationErrors[fieldName];
  }
</script>

<Modal bind:open {title} {size} on:close={handleClose} autoclose={false}>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    {#each fields as field}
      <div class="field-group">
        {#if field.type === 'input' || field.type === 'text'}
          <Label for={field.name} class="mb-2">
            {field.label}
            {#if field.required}<span class="text-red-500">*</span>{/if}
          </Label>
          <Input
            id={field.name}
            type={field.inputType || 'text'}
            value={getFieldValue(field)}
            placeholder={field.placeholder || ''}
            required={field.required || false}
            disabled={field.disabled || loading}
            class={hasFieldError(field.name) ? 'border-red-500' : ''}
            on:input={(e) => setFieldValue(field, e.target.value)}
          />
          {#if hasFieldError(field.name)}
            <p class="mt-1 text-sm text-red-500">{getFieldError(field.name)}</p>
          {/if}

        {:else if field.type === 'email'}
          <Label for={field.name} class="mb-2">
            {field.label}
            {#if field.required}<span class="text-red-500">*</span>{/if}
          </Label>
          <Input
            id={field.name}
            type="email"
            value={getFieldValue(field)}
            placeholder={field.placeholder || ''}
            required={field.required || false}
            disabled={field.disabled || loading}
            class={hasFieldError(field.name) ? 'border-red-500' : ''}
            on:input={(e) => setFieldValue(field, e.target.value)}
          />
          {#if hasFieldError(field.name)}
            <p class="mt-1 text-sm text-red-500">{getFieldError(field.name)}</p>
          {/if}

        {:else if field.type === 'number'}
          <Label for={field.name} class="mb-2">
            {field.label}
            {#if field.required}<span class="text-red-500">*</span>{/if}
          </Label>
          <Input
            id={field.name}
            type="number"
            value={getFieldValue(field)}
            placeholder={field.placeholder || ''}
            min={field.min}
            max={field.max}
            step={field.step}
            required={field.required || false}
            disabled={field.disabled || loading}
            class={hasFieldError(field.name) ? 'border-red-500' : ''}
            on:input={(e) => setFieldValue(field, parseFloat(e.target.value) || '')}
          />
          {#if hasFieldError(field.name)}
            <p class="mt-1 text-sm text-red-500">{getFieldError(field.name)}</p>
          {/if}

        {:else if field.type === 'date'}
          <Label for={field.name} class="mb-2">
            {field.label}
            {#if field.required}<span class="text-red-500">*</span>{/if}
          </Label>
          <Input
            id={field.name}
            type="date"
            value={getFieldValue(field)}
            required={field.required || false}
            disabled={field.disabled || loading}
            class={hasFieldError(field.name) ? 'border-red-500' : ''}
            on:input={(e) => setFieldValue(field, e.target.value)}
          />
          {#if hasFieldError(field.name)}
            <p class="mt-1 text-sm text-red-500">{getFieldError(field.name)}</p>
          {/if}

        {:else if field.type === 'select'}
          <Label for={field.name} class="mb-2">
            {field.label}
            {#if field.required}<span class="text-red-500">*</span>{/if}
          </Label>
          <Select
            id={field.name}
            items={field.options || []}
            bind:value={localFormData[field.name]}
            placeholder={field.placeholder || '선택하세요'}
            required={field.required || false}
            disabled={field.disabled || loading}
            class={hasFieldError(field.name) ? 'border-red-500' : ''}
          />
          {#if hasFieldError(field.name)}
            <p class="mt-1 text-sm text-red-500">{getFieldError(field.name)}</p>
          {/if}

        {:else if field.type === 'textarea'}
          <Label for={field.name} class="mb-2">
            {field.label}
            {#if field.required}<span class="text-red-500">*</span>{/if}
          </Label>
          <Textarea
            id={field.name}
            value={getFieldValue(field)}
            placeholder={field.placeholder || ''}
            rows={field.rows || 3}
            required={field.required || false}
            disabled={field.disabled || loading}
            class={hasFieldError(field.name) ? 'border-red-500' : ''}
            on:input={(e) => setFieldValue(field, e.target.value)}
          />
          {#if hasFieldError(field.name)}
            <p class="mt-1 text-sm text-red-500">{getFieldError(field.name)}</p>
          {/if}

        {:else if field.type === 'checkbox'}
          <div class="flex items-center">
            <Checkbox
              id={field.name}
              checked={getFieldValue(field)}
              disabled={field.disabled || loading}
              on:change={(e) => setFieldValue(field, e.target.checked)}
            />
            <Label for={field.name} class="ml-2">
              {field.label}
              {#if field.required}<span class="text-red-500">*</span>{/if}
            </Label>
          </div>
          {#if hasFieldError(field.name)}
            <p class="mt-1 text-sm text-red-500">{getFieldError(field.name)}</p>
          {/if}

        {:else if field.type === 'custom'}
          <!-- 커스텀 필드는 슬롯으로 처리 -->
          <slot name="custom-field" {field} value={getFieldValue(field)} setValue={(value) => setFieldValue(field, value)} />
        {/if}
      </div>
    {/each}

    <!-- 커스텀 필드 추가 슬롯 -->
    <slot name="additional-fields" {localFormData} setValue={setFieldValue} />
  </form>

  <svelte:fragment slot="footer">
    <Button 
      type="button" 
      color="alternative" 
      disabled={loading}
      on:click={handleCancel}
    >
      {cancelText}
    </Button>
    <Button 
      type="submit" 
      color="blue" 
      disabled={loading}
      on:click={handleSubmit}
    >
      {#if loading}
        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      {/if}
      {submitText}
    </Button>
  </svelte:fragment>
</Modal>

<style>
  .field-group {
    margin-bottom: 1rem;
  }
  
  .field-group:last-child {
    margin-bottom: 0;
  }
</style>